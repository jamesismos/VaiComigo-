import { PRICING_CONFIG, CategorySelection, Coupon } from '@/app/config/pricing';

/**
 * Simula o cálculo de uma rota
 * Em produção, isso seria substituído por uma chamada real à API de mapas
 */
export const calculateRoute = (
  origin: string,
  destination: string,
  stopsCount: number
): { distance: string; duration: number } => {
  const baseKm = 5 + Math.random() * 10;
  const baseMin = 10 + Math.random() * 20;
  const stopMultiplier = 1 + (stopsCount * 0.3);
  
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
  stopsCount: number
): number => {
  const distance = parseFloat(route.distance);
  const duration = route.duration;
  
  let totalPrice = PRICING_CONFIG.basePrice;
  
  // Preço base por categoria principal
  if (categories.isMarket) {
    totalPrice = PRICING_CONFIG.marketBase;
  } else if (categories.isDelivery) {
    totalPrice = PRICING_CONFIG.deliveryBase;
  } else if (categories.passengers > 0) {
    totalPrice = PRICING_CONFIG.passengerBase;
    if (categories.passengers > 1) {
      totalPrice += (categories.passengers - 1) * PRICING_CONFIG.passengerAdditional;
    }
  }
  
  // Adicionar distância e tempo
  totalPrice += distance * PRICING_CONFIG.pricePerKm;
  totalPrice += duration * PRICING_CONFIG.pricePerMin;
  
  // Taxa de pet (se aplicável com passageiros)
  if (categories.hasPet && categories.passengers > 0) {
    totalPrice += PRICING_CONFIG.petFee;
  }
  
  // Taxa de paradas
  totalPrice += stopsCount * PRICING_CONFIG.stopPointFee;
  
  return totalPrice;
};

/**
 * Calcula o preço final aplicando cupom de desconto
 */
export const calculateFinalPrice = (
  basePrice: number,
  coupon: Coupon | null
): number => {
  if (!coupon) return basePrice;
  
  if (coupon.type === 'percent') {
    return basePrice - (basePrice * coupon.discount / 100);
  }
  return Math.max(0, basePrice - coupon.discount);
};

/**
 * Obtém a descrição textual da categoria selecionada
 */
export const getCategoryDescription = (categories: CategorySelection): string => {
  if (categories.isMarket) return "VaiMercado - Compras rápidas";
  if (categories.isDelivery) return "VaiEntrega - Até 20kg";
  
  const parts: string[] = [];
  if (categories.passengers > 0) {
    parts.push(`${categories.passengers} ${categories.passengers === 1 ? 'passageiro' : 'passageiros'}`);
  }
  if (categories.hasPet) {
    parts.push('Pet');
  }
  return parts.length > 0 ? parts.join(' + ') : 'Selecione uma categoria';
};

/**
 * Valida se um cupom pode ser aplicado
 */
export const validateCoupon = (
  coupon: Coupon,
  categories: CategorySelection,
  totalPrice: number
): { valid: boolean; message?: string } => {
  // Verificar categoria específica
  if (coupon.categoryType) {
    const categoryMatch = 
      (coupon.categoryType === 'pet' && categories.hasPet) ||
      (coupon.categoryType === 'market' && categories.isMarket) ||
      (coupon.categoryType === 'delivery' && categories.isDelivery);
    
    if (!categoryMatch) {
      return {
        valid: false,
        message: 'Este cupom é válido apenas para a categoria específica'
      };
    }
  }
  
  // Verificar valor mínimo
  if (totalPrice < coupon.minValue) {
    return {
      valid: false,
      message: `Valor mínimo da corrida: R$ ${coupon.minValue.toFixed(2)}`
    };
  }
  
  return { valid: true };
};

/**
 * Formata valor monetário para exibição
 */
export const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

/**
 * Calcula o desconto aplicado pelo cupom
 */
export const calculateDiscount = (
  basePrice: number,
  coupon: Coupon | null
): number => {
  if (!coupon) return 0;
  return basePrice - calculateFinalPrice(basePrice, coupon);
};
