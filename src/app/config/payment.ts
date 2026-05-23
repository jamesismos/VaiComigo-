// Configuração de métodos de pagamento do VaiComigo

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'pix' 
  | 'bitcoin' 
  | 'cash' 
  | 'mercado_pago';

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  requiresSetup?: boolean;
  fee?: number; // Taxa em % (ex: 2.5 = 2.5%)
  minAmount?: number; // Valor mínimo
  maxAmount?: number; // Valor máximo
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodConfig> = {
  credit_card: {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    description: 'Visa, Mastercard, Elo, Amex',
    icon: '💳',
    enabled: true,
    requiresSetup: true,
    fee: 2.99, // Taxa média de cartão de crédito
    minAmount: 0,
  },
  debit_card: {
    id: 'debit_card',
    name: 'Cartão de Débito',
    description: 'Visa, Mastercard, Elo',
    icon: '💳',
    enabled: true,
    requiresSetup: true,
    fee: 1.99, // Taxa média de cartão de débito
    minAmount: 0,
  },
  pix: {
    id: 'pix',
    name: 'PIX',
    description: 'Pagamento instantâneo',
    icon: '📱',
    enabled: true,
    requiresSetup: false,
    fee: 0, // PIX geralmente não tem taxa
    minAmount: 0,
  },
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    description: 'Criptomoeda',
    icon: '₿',
    enabled: true,
    requiresSetup: true,
    fee: 1.5, // Taxa de conversão/processamento
    minAmount: 0,
  },
  cash: {
    id: 'cash',
    name: 'Dinheiro',
    description: 'Pague ao motorista',
    icon: '💵',
    enabled: true,
    requiresSetup: false,
    fee: 0,
    minAmount: 0,
  },
  mercado_pago: {
    id: 'mercado_pago',
    name: 'Mercado Pago',
    description: 'Saldo, cartão ou PIX',
    icon: '🛒',
    enabled: true,
    requiresSetup: true,
    fee: 2.49, // Taxa do Mercado Pago
    minAmount: 0,
  },
};

/**
 * Calcula o valor final com taxa do método de pagamento
 */
export function calculatePaymentTotal(
  baseAmount: number,
  paymentMethod: PaymentMethod
): number {
  const method = PAYMENT_METHODS[paymentMethod];
  
  if (!method.enabled) {
    throw new Error(`Método de pagamento ${method.name} não está habilitado`);
  }
  
  if (method.minAmount && baseAmount < method.minAmount) {
    throw new Error(`Valor mínimo para ${method.name}: R$ ${method.minAmount.toFixed(2)}`);
  }
  
  if (method.maxAmount && baseAmount > method.maxAmount) {
    throw new Error(`Valor máximo para ${method.name}: R$ ${method.maxAmount.toFixed(2)}`);
  }
  
  const fee = method.fee || 0;
  const feeAmount = (baseAmount * fee) / 100;
  
  return baseAmount + feeAmount;
}

/**
 * Obtém a taxa do método de pagamento
 */
export function getPaymentFee(paymentMethod: PaymentMethod): number {
  return PAYMENT_METHODS[paymentMethod].fee || 0;
}

/**
 * Lista métodos de pagamento disponíveis
 */
export function getAvailablePaymentMethods(): PaymentMethodConfig[] {
  return Object.values(PAYMENT_METHODS).filter(method => method.enabled);
}

/**
 * Verifica se um método de pagamento está disponível
 */
export function isPaymentMethodAvailable(
  paymentMethod: PaymentMethod,
  amount: number
): boolean {
  const method = PAYMENT_METHODS[paymentMethod];
  
  if (!method.enabled) {
    return false;
  }
  
  if (method.minAmount && amount < method.minAmount) {
    return false;
  }
  
  if (method.maxAmount && amount > method.maxAmount) {
    return false;
  }
  
  return true;
}
