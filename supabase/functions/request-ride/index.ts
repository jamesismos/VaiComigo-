import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Coordinate {
  lat: number;
  lng: number;
}

interface RoutePoint extends Coordinate {
  fullAddress: string;
}

interface RequestRideBody {
  cityId: string;
  origin: RoutePoint;
  destination: RoutePoint;
  stops: RoutePoint[];
  route: {
    distanceKm: number;
    duration: number;
    geometry: GeoJSON.LineString;
  };
  categories: {
    passengers: number;
    hasPet: boolean;
    isDelivery: boolean;
    isMarket: boolean;
    hasTrunk: boolean;
  };
  paymentMethod: "cash" | "driver_pix";
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function assertCoordinate(point: Coordinate) {
  if (
    typeof point?.lat !== "number" ||
    typeof point?.lng !== "number" ||
    point.lat < -90 ||
    point.lat > 90 ||
    point.lng < -180 ||
    point.lng > 180
  ) {
    throw new Error("Coordenada invalida.");
  }
}

function haversineDistanceKm(first: Coordinate, second: Coordinate): number {
  const earthRadiusKm = 6371;
  const dLat = ((second.lat - first.lat) * Math.PI) / 180;
  const dLng = ((second.lng - first.lng) * Math.PI) / 180;
  const lat1 = (first.lat * Math.PI) / 180;
  const lat2 = (second.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Metodo nao permitido." });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(500, { error: "Supabase server env ausente." });
    }

    const authHeader = request.headers.get("Authorization") ?? "";
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );

    if (authError || !authData.user) {
      return jsonResponse(401, { error: "Usuario nao autenticado." });
    }

    const body = (await request.json()) as RequestRideBody;
    assertCoordinate(body.origin);
    assertCoordinate(body.destination);
    body.stops?.forEach(assertCoordinate);

    if (!body.cityId || !["cash", "driver_pix"].includes(body.paymentMethod)) {
      return jsonResponse(400, { error: "Dados obrigatorios ausentes." });
    }

    if ((body.stops?.length ?? 0) > 3) {
      return jsonResponse(400, { error: "Limite de 3 paradas excedido." });
    }

    const { data: city, error: cityError } = await admin
      .from("cities")
      .select("*")
      .eq("id", body.cityId)
      .eq("is_active", true)
      .single();

    if (cityError || !city) {
      return jsonResponse(400, { error: "Cidade indisponivel." });
    }

    const cityCenter = { lat: Number(city.center_lat), lng: Number(city.center_lng) };
    const allPoints = [body.origin, ...(body.stops ?? []), body.destination];
    const outside = allPoints.some(
      (point) => haversineDistanceKm(cityCenter, point) > Number(city.service_radius_km),
    );

    if (outside) {
      return jsonResponse(400, { error: "Endereco fora da area ativa." });
    }

    const { data: appUser, error: userError } = await admin
      .from("users")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (userError || !appUser) {
      return jsonResponse(403, { error: "Perfil do usuario nao encontrado." });
    }

    const { data: passenger, error: passengerError } = await admin
      .from("passengers")
      .select("id")
      .eq("user_id", appUser.id)
      .single();

    if (passengerError || !passenger) {
      return jsonResponse(403, { error: "Perfil de passageiro nao encontrado." });
    }

    let quotedPrice =
      Number(city.base_price) +
      body.route.distanceKm * Number(city.price_per_km) +
      body.route.duration * Number(city.price_per_min) +
      (body.stops?.length ?? 0) * 1.5 +
      Math.max(0, Number(body.categories.passengers ?? 1) - 1) * 2.5;

    if (body.categories.hasPet) quotedPrice += 4.5;
    if (body.categories.isDelivery) quotedPrice += 2;
    if (body.categories.isMarket) quotedPrice += 4;
    if (body.categories.hasTrunk) quotedPrice += 5;

    quotedPrice = Number(quotedPrice.toFixed(2));
    const platformFee = Number(
      ((quotedPrice * Number(city.platform_fee_percent)) / 100).toFixed(2),
    );

    const { data: ride, error: rideError } = await admin
      .from("rides")
      .insert({
        city_id: city.id,
        passenger_id: passenger.id,
        payment_method: body.paymentMethod,
        origin: `POINT(${body.origin.lng} ${body.origin.lat})`,
        destination: `POINT(${body.destination.lng} ${body.destination.lat})`,
        origin_address: body.origin.fullAddress,
        destination_address: body.destination.fullAddress,
        stops: body.stops ?? [],
        route_geometry: body.route.geometry,
        quoted_distance_km: body.route.distanceKm,
        quoted_duration_min: body.route.duration,
        quoted_price: quotedPrice,
        platform_fee: platformFee,
      })
      .select("id")
      .single();

    if (rideError || !ride) {
      return jsonResponse(500, { error: "Falha ao criar corrida.", detail: rideError?.message });
    }

    await admin.from("ride_events").insert({
      ride_id: ride.id,
      actor_user_id: appUser.id,
      event_type: "created",
      metadata: { source: "edge-function" },
    });

    return jsonResponse(200, { id: ride.id });
  } catch (error) {
    return jsonResponse(400, {
      error: error instanceof Error ? error.message : "Requisicao invalida.",
    });
  }
});
