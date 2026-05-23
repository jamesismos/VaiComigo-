import { type CategorySelection, type Coupon } from "@/app/config/pricing";
import { getInitialCity } from "@/domains/cities/cityConfig";
import { getMapboxRoute, type RouteStop } from "@/domains/maps/mapboxService";
import { calculateRidePrice } from "@/domains/rides/ridePricing";

export interface CalculatedRoute {
  distance: string;
  duration: number;
  distanceKm: number;
  geometry: GeoJSON.LineString;
}

export const calculateRoute = async (points: RouteStop[]): Promise<CalculatedRoute> => {
  const route = await getMapboxRoute(points);

  return {
    distance: route.distanceKm.toFixed(2),
    distanceKm: route.distanceKm,
    duration: route.durationMin,
    geometry: route.geometry,
  };
};

export const calculatePrice = (
  route: { distance: string; duration: number; distanceKm?: number },
  categories: CategorySelection,
  stopsCount: number,
): number => {
  const city = getInitialCity();
  const distanceKm = route.distanceKm ?? Number(route.distance);

  return calculateRidePrice(
    city,
    {
      distanceKm,
      durationMin: route.duration,
      geometry: { type: "LineString", coordinates: [] },
    },
    categories,
    stopsCount,
  ).grossPrice;
};

export const calculateFinalPrice = (
  basePrice: number,
  coupon: Coupon | null = null,
): number => {
  if (!coupon) return basePrice;

  if (coupon.type === "percent") {
    return Number((basePrice - (basePrice * coupon.discount) / 100).toFixed(2));
  }

  return Math.max(0, Number((basePrice - coupon.discount).toFixed(2)));
};

export const getCategoryDescription = (
  categories: CategorySelection,
): string => {
  if (categories.isMarket) {
    const parts: string[] = ["VaiMercado - compras rapidas"];
    if (categories.passengers > 0) {
      parts.push(
        `${categories.passengers} ${categories.passengers === 1 ? "passageiro" : "passageiros"}`,
      );
    }
    if (categories.hasTrunk) {
      parts.push("porta-malas");
    }
    return parts.join(" + ");
  }

  if (categories.isDelivery) return "VaiEntrega - ate 20kg";

  const parts: string[] = [];
  if (categories.passengers > 0) {
    parts.push(
      `${categories.passengers} ${categories.passengers === 1 ? "passageiro" : "passageiros"}`,
    );
  }
  if (categories.hasPet) {
    parts.push("pet");
  }

  return parts.length > 0 ? parts.join(" + ") : "Selecione uma categoria";
};

export const validateCoupon = (
  coupon: Coupon,
  categories: CategorySelection,
  totalPrice: number,
): { valid: boolean; message?: string } => {
  if (coupon.categoryType) {
    const categoryMatch =
      (coupon.categoryType === "pet" && categories.hasPet) ||
      (coupon.categoryType === "market" && categories.isMarket) ||
      (coupon.categoryType === "delivery" && categories.isDelivery);

    if (!categoryMatch) {
      return {
        valid: false,
        message: "Este cupom e valido apenas para a categoria especifica.",
      };
    }
  }

  if (totalPrice < coupon.minValue) {
    return {
      valid: false,
      message: `Valor minimo da corrida: R$ ${coupon.minValue.toFixed(2)}`,
    };
  }

  return { valid: true };
};

export const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
};

export const calculateDiscount = (
  basePrice: number,
  coupon: Coupon | null,
): number => {
  return Number((basePrice - calculateFinalPrice(basePrice, coupon)).toFixed(2));
};
