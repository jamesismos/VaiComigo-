import {
  PRICING_CONFIG,
  CategorySelection,
  Coupon,
  RegionType,
} from "@/app/config/pricing";

/**
 * Simula o cálculo de uma rota
 * Em produção, isso seria substituído por uma chamada real à API de mapas
 */
export const calculateRoute = (
  origin: string,
  destination: string,
  stopsCount: number,
): { distance: string; duration: number } => {
  const baseKm = 5 + Math.random() * 10;
  const baseMin = 10 + Math.random() * 20;
  const stopMultiplier = 1 + stopsCount * 0.3;

  return {
    distance: (baseKm * stopMultiplier).toFixed(1),
    duration: Math.round(baseMin * stopMultiplier),
  };
};

/**
 * Calcula o preço da corrida baseado na categoria e rota
 */
export const calculatePrice = (
  route: { distance: string; duration: number },
  categories: CategorySelection,
  stopsCount: number,
  region: RegionType,
): number => {
  const config = PRICING_CONFIG[region];
  const distance = parseFloat(route.distance);
  const duration = route.duration;

  let totalPrice = config.basePrice;

  // Preço base por categoria principal
  if (categories.isMarket) {
    totalPrice = config.marketBase;
    // Adicionar passageiros se selecionados
    if (categories.passengers > 0) {
      totalPrice += config.passengerBase;
      if (categories.passengers > 1) {
        totalPrice += (categories.passengers - 1) * config.passengerAdditional;
      }
    }
    // Taxa do porta-malas
    if (categories.hasTrunk) {
      totalPrice += config.trunkFee;
    }
  } else if (categories.isDelivery) {
    totalPrice = config.deliveryBase;
  } else if (categories.passengers > 0) {
    totalPrice = config.passengerBase;
    if (categories.passengers > 1) {
      totalPrice += (categories.passengers - 1) * config.passengerAdditional;
    }
  }

  // Adicionar distância e tempo
  totalPrice += distance * config.pricePerKm;
  totalPrice += duration * config.pricePerMin;

  // Taxa de pet (se aplicável com passageiros)
  if (categories.hasPet && categories.passengers > 0) {
    totalPrice += config.petFee;
  }

  // Taxa de porta malas (se aplicável)
  if (categories.hasTrunk) {
    totalPrice += config.trunkFee;
  }

  // Taxa de paradas
  totalPrice += stopsCount * config.stopPointFee;

  return totalPrice;
};

/**
 * Calcula o preço final aplicando cupom de desconto
 */
export const calculateFinalPrice = (
  basePrice: number,
  coupon: Coupon | null,
): number => {
  if (!coupon) return basePrice;

  if (coupon.type === "percent") {
    return basePrice - (basePrice * coupon.discount) / 100;
  }
  return Math.max(0, basePrice - coupon.discount);
};

/**
 * Obtém a descrição textual da categoria selecionada
 */
export const getCategoryDescription = (
  categories: CategorySelection,
): string => {
  if (categories.isMarket) {
    const parts: string[] = ["VaiMercado - Compras rápidas"];
    if (categories.passengers > 0) {
      parts.push(
        `${categories.passengers} ${categories.passengers === 1 ? "passageiro" : "passageiros"}`,
      );
    }
    if (categories.hasTrunk) {
      parts.push("Porta malas");
    }
    return parts.join(" + ");
  }
  if (categories.isDelivery) return "VaiEntrega - Até 20kg";

  const parts: string[] = [];
  if (categories.passengers > 0) {
    parts.push(
      `${categories.passengers} ${categories.passengers === 1 ? "passageiro" : "passageiros"}`,
    );
  }
  if (categories.hasPet) {
    parts.push("Pet");
  }
  return parts.length > 0 ? parts.join(" + ") : "Selecione uma categoria";
};

/**
 * Valida se um cupom pode ser aplicado
 */
export const validateCoupon = (
  coupon: Coupon,
  categories: CategorySelection,
  totalPrice: number,
): { valid: boolean; message?: string } => {
  // Verificar categoria específica
  if (coupon.categoryType) {
    const categoryMatch =
      (coupon.categoryType === "pet" && categories.hasPet) ||
      (coupon.categoryType === "market" && categories.isMarket) ||
      (coupon.categoryType === "delivery" && categories.isDelivery);

    if (!categoryMatch) {
      return {
        valid: false,
        message: "Este cupom é válido apenas para a categoria específica",
      };
    }
  }

  // Verificar valor mínimo
  if (totalPrice < coupon.minValue) {
    return {
      valid: false,
      message: `Valor mínimo da corrida: R$ ${coupon.minValue.toFixed(2)}`,
    };
  }

  return { valid: true };
};

/**
 * Formata valor monetário para exibição
 */
export const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
};

/**
 * Calcula o desconto aplicado pelo cupom
 */
export const calculateDiscount = (
  basePrice: number,
  coupon: Coupon | null,
): number => {
  if (!coupon) return 0;
  return basePrice - calculateFinalPrice(basePrice, coupon);
};
