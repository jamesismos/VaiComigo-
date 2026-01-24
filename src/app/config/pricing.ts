// Configurações de preço do VaiComigo por região
// Valores ajustados para regiões de Minas Gerais

export const PRICING_CONFIG = {
  "vale-jequitinhonha": {
    // Valores base
    basePrice: 3.0, // Bandeirada inicial (R$1,50 a R$4,50)
    pricePerKm: 2.0, // Por quilômetro (R$1,00 a R$2,45, ajustado para interior)
    pricePerMin: 0.25, // Por minuto (R$0,12 a R$0,30)
    stopPointFee: 3.0, // Taxa por parada adicional

    // VaiComigo! (Passageiros)
    passengerBase: 12.0, // Base para 1 passageiro
    passengerAdditional: 5.0, // Adicional por passageiro extra

    // VaiPet
    petFee: 8.0, // Taxa adicional para viagem com pet

    // VaiEntrega
    deliveryBase: 15.0, // Base para entregas
    deliveryMaxWeight: 20, // Peso máximo em kg

    // VaiMercado
    marketBase: 20.0, // Base para compras em mercado
    trunkFee: 5.0, // Taxa para usar porta malas

    // Limites
    maxStops: 3, // Número máximo de paradas
    maxPassengers: 4, // Número máximo de passageiros
    minPassengers: 1, // Número mínimo de passageiros
  },
  // Placeholder para outras regiões - serão implementadas posteriormente
  "belo-horizonte": {
    basePrice: 4.5,
    pricePerKm: 2.5,
    pricePerMin: 0.3,
    stopPointFee: 3.0,
    passengerBase: 12.0,
    passengerAdditional: 5.0,
    petFee: 8.0,
    deliveryBase: 15.0,
    deliveryMaxWeight: 20,
    marketBase: 20.0,
    trunkFee: 5.0,
    maxStops: 3,
    maxPassengers: 4,
    minPassengers: 1,
  },
  interior: {
    basePrice: 3.5,
    pricePerKm: 2.2,
    pricePerMin: 0.28,
    stopPointFee: 3.0,
    passengerBase: 12.0,
    passengerAdditional: 5.0,
    petFee: 8.0,
    deliveryBase: 15.0,
    deliveryMaxWeight: 20,
    marketBase: 20.0,
    trunkFee: 5.0,
    maxStops: 3,
    maxPassengers: 4,
    minPassengers: 1,
  },
};

// Categorias disponíveis
export type CategoryType = "passenger" | "pet" | "delivery" | "market";
// Regiões disponíveis em Minas Gerais
export type RegionType = "vale-jequitinhonha" | "belo-horizonte" | "interior";
// Interface para seleção de categorias
export interface CategorySelection {
  passengers: number;
  hasPet: boolean;
  isDelivery: boolean;
  isMarket: boolean;
  hasTrunk: boolean;
}

// Descrições das categorias
export const CATEGORY_DESCRIPTIONS = {
  passenger: "Transporte de passageiros",
  pet: "Viagem com animais de estimação",
  delivery: "Entregas até 20kg",
  market: "Compras em supermercados e lojas",
};

// Status de corrida
export type RideStatus =
  | "idle"
  | "searching"
  | "accepted"
  | "ongoing"
  | "completed";

// Tipos de cupom
export type CouponType = "percent" | "fixed";

export interface Coupon {
  code: string;
  discount: number;
  type: CouponType;
  description: string;
  minValue: number;
  categoryType?: CategoryType;
}
