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
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const OSRM_BASE_URL = "https://router.project-osrm.org";

export function getMapboxToken(): string {
  return import.meta.env.VITE_MAPBOX_TOKEN ?? "";
}

export function assertMapboxConfigured(): void {
  if (!getMapboxToken()) {
    throw new Error("Mapbox nao configurado. Defina VITE_MAPBOX_TOKEN no .env.local.");
  }
}

export function getMapsProvider(): "mapbox" | "openstreetmap" {
  return getMapboxToken() ? "mapbox" : "openstreetmap";
}

function confidenceFromRelevance(relevance = 0): ValidatedAddress["confidence"] {
  if (relevance >= 0.95) return "exact";
  if (relevance >= 0.85) return "high";
  if (relevance >= 0.7) return "medium";
  return "low";
}

export async function searchMapboxAddresses(query: string, limit = 5): Promise<ValidatedAddress[]> {
  if (query.trim().length < 3) return [];

  if (!getMapboxToken()) {
    return searchOpenStreetMapAddresses(query, limit);
  }

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
  if (!getMapboxToken()) {
    return reverseOpenStreetMapGeocode(point);
  }

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
  if (points.length < 2) {
    throw new Error("Origem e destino validados sao obrigatorios.");
  }

  if (points.length > 5) {
    throw new Error("Limite excedido: origem, destino e ate 3 paradas.");
  }

  if (!getMapboxToken()) {
    return getOpenStreetMapRoute(points);
  }

  assertMapboxConfigured();

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

interface NominatimAddress {
  road?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  postcode?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  importance?: number;
  address?: NominatimAddress;
}

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
}

interface OsrmResponse {
  code: string;
  message?: string;
  routes?: OsrmRoute[];
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isPadreParaisoResult(result: NominatimResult): boolean {
  const address = result.address;
  const city = address?.city ?? address?.town ?? address?.village ?? address?.municipality ?? "";
  const fullText = normalizeText(`${city} ${address?.state ?? ""} ${result.display_name}`);

  return fullText.includes("padre paraiso") && (fullText.includes("minas gerais") || fullText.includes(" mg"));
}

function labelFromNominatim(result: NominatimResult): string {
  const address = result.address;
  const road = address?.road;
  const number = address?.house_number;
  if (road && number) return `${road}, ${number}`;
  if (road) return road;
  return result.display_name.split(",")[0] ?? result.display_name;
}

function confidenceFromImportance(importance = 0): ValidatedAddress["confidence"] {
  if (importance >= 0.75) return "high";
  if (importance >= 0.45) return "medium";
  return "low";
}

async function searchOpenStreetMapAddresses(query: string, limit: number): Promise<ValidatedAddress[]> {
  const city = getInitialCity();
  const viewbox = [
    city.centerLng - 0.16,
    city.centerLat + 0.16,
    city.centerLng + 0.16,
    city.centerLat - 0.16,
  ].join(",");
  const params = new URLSearchParams({
    format: "jsonv2",
    q: `${query}, Padre Paraiso, Minas Gerais, Brasil`,
    addressdetails: "1",
    countrycodes: "br",
    limit: String(Math.max(limit * 2, limit)),
    bounded: "1",
    viewbox,
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Falha ao consultar enderecos no OpenStreetMap.");
  }

  const data = (await response.json()) as NominatimResult[];

  return data
    .filter(isPadreParaisoResult)
    .slice(0, limit)
    .map((result) => ({
      id: `osm:${result.place_id}`,
      label: labelFromNominatim(result),
      fullAddress: result.display_name,
      lat: Number(result.lat),
      lng: Number(result.lon),
      confidence: confidenceFromImportance(result.importance),
    }));
}

async function reverseOpenStreetMapGeocode(point: GeoPoint): Promise<ValidatedAddress> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(point.lat),
    lon: String(point.lng),
    addressdetails: "1",
    zoom: "18",
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Falha ao validar localizacao no OpenStreetMap.");
  }

  const result = (await response.json()) as NominatimResult;

  if (!result.display_name) {
    throw new Error("Localizacao atual sem endereco validado.");
  }

  return {
    id: `osm:${result.place_id}`,
    label: labelFromNominatim(result),
    fullAddress: result.display_name,
    lat: point.lat,
    lng: point.lng,
    confidence: confidenceFromImportance(result.importance),
  };
}

async function getOpenStreetMapRoute(points: RouteStop[]): Promise<RouteResult> {
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");
  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    alternatives: "false",
    steps: "false",
  });

  const response = await fetch(`${OSRM_BASE_URL}/route/v1/driving/${coordinates}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Falha ao calcular rota no OSRM.");
  }

  const data = (await response.json()) as OsrmResponse;
  const route = data.routes?.[0];

  if (!route || data.code !== "Ok") {
    throw new Error(data.message ?? "Nao foi encontrada rota viavel.");
  }

  return {
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationMin: Math.ceil(route.duration / 60),
    geometry: route.geometry,
  };
}
