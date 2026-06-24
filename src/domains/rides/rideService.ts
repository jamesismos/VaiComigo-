import { supabase } from "@/lib/supabase";
import type { CategorySelection } from "@/app/config/pricing";
import type { CalculatedRoute } from "@/app/utils/calculations";
import { calculateRidePrice } from "@/domains/rides/ridePricing";
import { getInitialCity } from "@/domains/cities/cityConfig";
import type { RouteStop } from "@/domains/maps/mapboxService";

export interface RideDraft {
  origin: RouteStop;
  destination: RouteStop;
  stops: RouteStop[];
  route: CalculatedRoute;
  categories: CategorySelection;
  paymentMethod: "cash" | "driver_pix";
}

export interface CreatedRide {
  id: string;
  mode: "edge-function" | "local-fallback";
}

function localFallbackRide(draft: RideDraft): CreatedRide {
  const city = getInitialCity();
  const quote = calculateRidePrice(
    city,
    {
      distanceKm: draft.route.distanceKm,
      durationMin: draft.route.duration,
      geometry: draft.route.geometry,
    },
    draft.categories,
    draft.stops.length,
  );
  const id = crypto.randomUUID();

  localStorage.setItem(
    `vai-ride:${id}`,
    JSON.stringify({
      id,
      cityId: city.id,
      ...draft,
      quote,
      status: "requested",
      createdAt: new Date().toISOString(),
    }),
  );

  return { id, mode: "local-fallback" };
}

export async function requestRide(draft: RideDraft): Promise<CreatedRide> {
  if (!supabase) {
    return localFallbackRide(draft);
  }

  const city = getInitialCity();
  const quote = calculateRidePrice(
    city,
    {
      distanceKm: draft.route.distanceKm,
      durationMin: draft.route.duration,
      geometry: draft.route.geometry,
    },
    draft.categories,
    draft.stops.length,
  );

  const { data, error } = await supabase.functions.invoke("request-ride", {
    body: {
      cityId: city.id,
      origin: draft.origin,
      destination: draft.destination,
      stops: draft.stops,
      route: draft.route,
      quote,
      categories: draft.categories,
      paymentMethod: draft.paymentMethod,
    },
  });

  if (error || !data?.id) {
    console.warn("request-ride indisponivel; usando fallback local.", error);
    return localFallbackRide(draft);
  }

  return { id: data.id as string, mode: "edge-function" };
}
