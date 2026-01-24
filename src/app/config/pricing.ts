// Configurações de preço do VaiComigo
// Edite esses valores para ajustar os preços do aplicativo

export const PRICING_CONFIG = {
  // Valores base
  basePrice: 5.00,              // Preço inicial da corrida
  pricePerKm: 2.50,             // Preço por quilômetro
  pricePerMin: 0.50,            // Preço por minuto
  stopPointFee: 3.00,           // Taxa por parada adicional
  
  // VaiComigo! (Passageiros)
  passengerBase: 12.00,         // Base para 1 passageiro
  passengerAdditional: 5.00,    // Adicional por passageiro extra
  
  // VaiPet
  petFee: 8.00,                 // Taxa adicional para viagem com pet
  
  // VaiEntrega
  deliveryBase: 15.00,          // Base para entregas
  deliveryMaxWeight: 20,        // Peso máximo em kg
  
  // VaiMercado
  marketBase: 20.00,            // Base para compras em mercado
  
  // Limites
  maxStops: 3,                  // Número máximo de paradas
  maxPassengers: 4,             // Número máximo de passageiros
  minPassengers: 1,             // Número mínimo de passageiros
};

// Categorias disponíveis
export type CategoryType = 'passenger' | 'pet' | 'delivery' | 'market';

// Interface para seleção de categorias
export interface CategorySelection {
  passengers: number;
  hasPet: boolean;
  isDelivery: boolean;
  isMarket: boolean;
}

// Descrições das categorias
export const CATEGORY_DESCRIPTIONS = {
  passenger: 'Transporte de passageiros',
  pet: 'Viagem com animais de estimação',
  delivery: 'Entregas até 20kg',
  market: 'Compras em supermercados e lojas',
};

// Status de corrida
export type RideStatus = 'idle' | 'searching' | 'accepted' | 'ongoing' | 'completed';

// Tipos de cupom
export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  code: string;
  discount: number;
  type: CouponType;
  description: string;
  minValue: number;
  categoryType?: CategoryType;
}
