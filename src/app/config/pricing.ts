// Configurações de preço do VaiComigo por região
// Estrutura: Regiões > Cidades (com override opcional)

export interface PricingConfig {
  basePrice: number;
  pricePerKm: number;
  pricePerMin: number;
  stopPointFee: number;
  fuelPricePerKmMG: number;
  passengerBase: number;
  passengerAdditional: number;
  petFee: number;
  deliveryBase: number;
  deliveryMaxWeight: number;
  marketBase: number;
  trunkFee: number;
  maxStops: number;
  maxPassengers: number;
  minPassengers: number;
}

// Configuração de comissão da plataforma
export interface CommissionConfig {
  platformPercentage: number;  // % que a plataforma fica (ex: 20 = 20%)
  driverPercentage: number;     // % que o motorista recebe (ex: 80 = 80%)
}

// Comissão padrão (baseado em Uber 25%, 99 20-25%, mercado brasileiro)
// Para cidades menores, usar 15-20% é mais competitivo
export const COMMISSION_CONFIG: CommissionConfig = {
  platformPercentage: 18,  // 18% para a plataforma (seu lucro)
  driverPercentage: 82,     // 82% para o motorista
};

/**
 * Calcula quanto o motorista recebe e quanto a plataforma ganha
 */
export function calculateCommission(totalPrice: number, config: CommissionConfig = COMMISSION_CONFIG) {
  const platformEarning = totalPrice * (config.platformPercentage / 100);
  const driverEarning = totalPrice * (config.driverPercentage / 100);

  return {
    totalPrice,
    platformEarning: Number(platformEarning.toFixed(2)),
    driverEarning: Number(driverEarning.toFixed(2)),
    platformPercentage: config.platformPercentage,
    driverPercentage: config.driverPercentage,
  };
}

// Mapeamento de cidades para regiões
export const CITY_TO_REGION: Record<string, string> = {
  'guanhaes': 'vale-jequitinhonha',
  'padre paraiso': 'vale-jequitinhonha',
  // Adicione mais cidades conforme expandir
};

// Preços por REGIÃO (estrutura principal)
export const REGION_PRICING: Record<string, PricingConfig> = {
  'vale-jequitinhonha': {
    // Valores base para Vale do Jequitinhonha (região)
    basePrice: 3.00,
    pricePerKm: 1.50,
    pricePerMin: 0.30,
    stopPointFee: 2.00,
    fuelPricePerKmMG: 1.20,

    // VaiComigo! (Passageiros)
    passengerBase: 8.00,
    passengerAdditional: 3.00,

    // VaiPet
    petFee: 5.00,

    // VaiEntrega
    deliveryBase: 10.00,
    deliveryMaxWeight: 20,

    // VaiMercado
    marketBase: 12.00,
    trunkFee: 5.0,

    // Limites
    maxStops: 3,
    maxPassengers: 4,
    minPassengers: 1,
  },
  'belo-horizonte': {
    basePrice: 4.5,
    pricePerKm: 2.5,
    pricePerMin: 0.3,
    stopPointFee: 3.0,
    fuelPricePerKmMG: 1.50,
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
  'interior': {
    basePrice: 3.5,
    pricePerKm: 2.2,
    pricePerMin: 0.28,
    stopPointFee: 3.0,
    fuelPricePerKmMG: 1.30,
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

// Override de preços por CIDADE (opcional - apenas se precisar diferenciar)
// Se uma cidade não estiver aqui, usa o preço da região
export const CITY_PRICING_OVERRIDE: Record<string, Partial<PricingConfig>> = {
  'padre paraiso': {
    // Padre Paraíso tem preços ligeiramente menores que a região
    basePrice: 2.50,
    pricePerKm: 1.30,
    pricePerMin: 0.25,
    stopPointFee: 1.50,
    fuelPricePerKmMG: 1.10,
    passengerBase: 7.00,
    passengerAdditional: 2.50,
    petFee: 4.50,
    deliveryBase: 9.00,
    marketBase: 11.00,
  },
};

// Configuração padrão (Vale do Jequitinhonha)
export const PRICING_CONFIG: PricingConfig = REGION_PRICING['vale-jequitinhonha'];

/**
 * Detecta a região baseado na cidade
 */
export function detectRegion(location: string): string {
  const normalized = location.toLowerCase();

  // Detectar cidade primeiro
  const city = detectCity(normalized);

  // Retornar região da cidade
  return CITY_TO_REGION[city] || 'vale-jequitinhonha';
}

/**
 * Detecta a cidade baseado no endereço
 */
export function detectCity(location: string): string {
  const normalized = typeof location === 'string' ? location.toLowerCase() : '';

  if (normalized.includes('padre paraíso') || normalized.includes('padre paraiso')) {
    return 'padre paraiso';
  }

  if (normalized.includes('guanhães') || normalized.includes('guanhaes')) {
    return 'guanhaes';
  }

  // Padrão: Guanhães (Vale do Jequitinhonha)
  return 'guanhaes';
}

/**
 * Obtém a configuração de preços para uma cidade/região
 * Prioriza override da cidade, depois usa preço da região
 */
export function getPricingForCity(cityOrLocation: string): PricingConfig {
  const city = detectCity(cityOrLocation);
  const region = CITY_TO_REGION[city] || 'vale-jequitinhonha';

  // Verificar se há override para a cidade
  const cityOverride = CITY_PRICING_OVERRIDE[city];
  if (cityOverride) {
    const regionPricing = REGION_PRICING[region] || PRICING_CONFIG;
    // Mesclar override com preços da região
    return {
      ...regionPricing,
      ...cityOverride,
    };
  }

  // Usar preços da região
  return REGION_PRICING[region] || PRICING_CONFIG;
}

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
