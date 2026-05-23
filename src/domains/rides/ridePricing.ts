import type { CategorySelection } from "@/app/config/pricing";
import type { CityConfig } from "@/domains/cities/cityConfig";
import type { RouteResult } from "@/domains/maps/mapboxService";

export interface RidePriceQuote {
  grossPrice: number;
  platformFee: number;
  driverReceivesDirectly: number;
  distanceKm: number;
  durationMin: number;
}

export function calculateRidePrice(
  city: CityConfig,
  route: RouteResult,
  categories: CategorySelection,
  stopsCount: number,
): RidePriceQuote {
  if (stopsCount > city.maxStops) {
    throw new Error(`Limite de ${city.maxStops} paradas excedido.`);
  }

  let grossPrice = city.basePrice;

  if (categories.isDelivery) grossPrice += 2;
  if (categories.isMarket) grossPrice += 4;
  if (categories.hasPet) grossPrice += 4.5;
  if (categories.hasTrunk) grossPrice += 5;

  grossPrice += Math.max(0, categories.passengers - 1) * 2.5;
  grossPrice += stopsCount * 1.5;
  grossPrice += route.distanceKm * city.pricePerKm;
  grossPrice += route.durationMin * city.pricePerMin;

  const roundedGross = Number(grossPrice.toFixed(2));
  const platformFee = Number(((roundedGross * city.platformFeePercent) / 100).toFixed(2));

  return {
    grossPrice: roundedGross,
    platformFee,
    driverReceivesDirectly: roundedGross,
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
  };
}
