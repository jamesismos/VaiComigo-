import { getInitialCity } from "@/domains/cities/cityConfig";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ValidatedAddress extends GeoPoint {
  id: string;
  label: string;
  fullAddress: string;
  confidence: "exact" | "high" | "medium" | "low";
}

export interface RouteStop extends ValidatedAddress {
  kind: "origin" | "destination" | "stop";
}

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: GeoJSON.LineString;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  text?: string;
  center: [number, number];
  relevance?: number;
}

interface MapboxGeocodingResponse {
  features?: MapboxFeature[];
}

interface MapboxDirectionsRoute {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
}

interface MapboxDirectionsResponse {
  routes?: MapboxDirectionsRoute[];
  code?: string;
  message?: string;
}

const MAPBOX_BASE_URL = "https://api.mapbox.com";

export function getMapboxToken(): string {
  return import.meta.env.VITE_MAPBOX_TOKEN ?? "";
}

export function assertMapboxConfigured(): void {
  if (!getMapboxToken()) {
    throw new Error("Mapbox nao configurado. Defina VITE_MAPBOX_TOKEN no .env.local.");
  }
}

function confidenceFromRelevance(relevance = 0): ValidatedAddress["confidence"] {
  if (relevance >= 0.95) return "exact";
  if (relevance >= 0.85) return "high";
  if (relevance >= 0.7) return "medium";
  return "low";
}

export async function searchMapboxAddresses(query: string, limit = 5): Promise<ValidatedAddress[]> {
  if (query.trim().length < 3) return [];

  assertMapboxConfigured();
  const city = getInitialCity();
  const proximity = `${city.centerLng},${city.centerLat}`;
  const params = new URLSearchParams({
    access_token: getMapboxToken(),
    autocomplete: "true",
    country: "br",
    language: "pt-BR",
    limit: String(limit),
    proximity,
    types: "address,poi,place,locality,neighborhood",
  });

  const response = await fetch(
    `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Falha ao consultar autocomplete do Mapbox.");
  }

  const data = (await response.json()) as MapboxGeocodingResponse;

  return (data.features ?? []).map((feature) => ({
    id: feature.id,
    label: feature.text ?? feature.place_name,
    fullAddress: feature.place_name,
    lng: feature.center[0],
    lat: feature.center[1],
    confidence: confidenceFromRelevance(feature.relevance),
  }));
}

export async function reverseMapboxGeocode(point: GeoPoint): Promise<ValidatedAddress> {
  assertMapboxConfigured();
  const params = new URLSearchParams({
    access_token: getMapboxToken(),
    language: "pt-BR",
    limit: "1",
  });

  const response = await fetch(
    `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${point.lng},${point.lat}.json?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Falha ao validar localizacao atual no Mapbox.");
  }

  const data = (await response.json()) as MapboxGeocodingResponse;
  const feature = data.features?.[0];

  if (!feature) {
    throw new Error("Localizacao atual sem endereco validado.");
  }

  return {
    id: feature.id,
    label: feature.text ?? feature.place_name,
    fullAddress: feature.place_name,
    lng: point.lng,
    lat: point.lat,
    confidence: confidenceFromRelevance(feature.relevance),
  };
}

export async function getMapboxRoute(points: RouteStop[]): Promise<RouteResult> {
  assertMapboxConfigured();

  if (points.length < 2) {
    throw new Error("Origem e destino validados sao obrigatorios.");
  }

  if (points.length > 5) {
    throw new Error("Limite excedido: origem, destino e ate 3 paradas.");
  }

  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");
  const params = new URLSearchParams({
    access_token: getMapboxToken(),
    alternatives: "false",
    geometries: "geojson",
    language: "pt-BR",
    overview: "full",
    steps: "false",
  });

  const response = await fetch(
    `${MAPBOX_BASE_URL}/directions/v5/mapbox/driving/${coordinates}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Falha ao calcular rota real no Mapbox.");
  }

  const data = (await response.json()) as MapboxDirectionsResponse;
  const route = data.routes?.[0];

  if (!route || data.code === "NoRoute") {
    throw new Error(data.message ?? "Nao foi encontrada rota viavel.");
  }

  return {
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationMin: Math.ceil(route.duration / 60),
    geometry: route.geometry,
  };
}
