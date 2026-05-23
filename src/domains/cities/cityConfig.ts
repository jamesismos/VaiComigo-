export interface CityConfig {
  id: string;
  name: string;
  state: string;
  slug: string;
  isActive: boolean;
  centerLat: number;
  centerLng: number;
  serviceRadiusKm: number;
  basePrice: number;
  pricePerKm: number;
  pricePerMin: number;
  platformFeePercent: number;
  maxStops: number;
}

export const PADRE_PARAISO_CITY: CityConfig = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Padre Paraiso",
  state: "MG",
  slug: "padre-paraiso-mg",
  isActive: true,
  centerLat: -17.0739,
  centerLng: -41.5081,
  serviceRadiusKm: 12,
  basePrice: 7,
  pricePerKm: 1.3,
  pricePerMin: 0.25,
  platformFeePercent: 15,
  maxStops: 3,
};

export const ACTIVE_CITIES: CityConfig[] = [PADRE_PARAISO_CITY];

export function getInitialCity(): CityConfig {
  return PADRE_PARAISO_CITY;
}

export function haversineDistanceKm(
  first: { lat: number; lng: number },
  second: { lat: number; lng: number },
): number {
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

export function isCoordinateInsideCity(
  city: CityConfig,
  coordinate: { lat: number; lng: number },
): boolean {
  const distance = haversineDistanceKm(
    { lat: city.centerLat, lng: city.centerLng },
    coordinate,
  );

  return distance <= city.serviceRadiusKm;
}

export function validateRouteInsideCity(
  city: CityConfig,
  coordinates: Array<{ lat: number; lng: number }>,
): { valid: boolean; message?: string } {
  if (!city.isActive) {
    return { valid: false, message: "Cidade indisponivel para operacao." };
  }

  const outside = coordinates.find((coordinate) => !isCoordinateInsideCity(city, coordinate));
  if (outside) {
    return {
      valid: false,
      message: `Endereco fora da area ativa de ${city.name} - ${city.state}.`,
    };
  }

  return { valid: true };
}
