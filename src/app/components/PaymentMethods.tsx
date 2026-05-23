import { useState } from "react";
import { CreditCard, Smartphone, Wallet, DollarSign, ShoppingCart, Check } from "lucide-react";
import {
  PaymentMethod,
  PAYMENT_METHODS,
  getAvailablePaymentMethods,
  isPaymentMethodAvailable,
  calculatePaymentTotal,
} from "@/app/config/payment";

interface PaymentMethodsProps {
  selectedMethod?: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  totalAmount: number;
  showFees?: boolean;
}

const methodIcons: Record<PaymentMethod, typeof CreditCard> = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  pix: Smartphone,
  bitcoin: Wallet,
  cash: DollarSign,
  mercado_pago: ShoppingCart,
};

export function PaymentMethods({
  selectedMethod,
  onSelectMethod,
  totalAmount,
  showFees = true,
}: PaymentMethodsProps) {
  const availableMethods = getAvailablePaymentMethods();

  const getMethodIcon = (methodId: PaymentMethod) => {
    const Icon = methodIcons[methodId];
    return Icon ? <Icon size={24} /> : <CreditCard size={24} />;
  };

  return (
    <div className="space-y-3">
      {availableMethods.map((method) => {
        const isAvailable = isPaymentMethodAvailable(method.id, totalAmount);
        const isSelected = selectedMethod === method.id;
        const finalAmount = isAvailable
          ? calculatePaymentTotal(totalAmount, method.id)
          : totalAmount;
        const fee = method.fee || 0;
        const feeAmount = (totalAmount * fee) / 100;

        return (
          <button
            key={method.id}
            onClick={() => isAvailable && onSelectMethod(method.id)}
            disabled={!isAvailable}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 bg-card"
            } ${!isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {getMethodIcon(method.id)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">{method.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {method.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="p-1 bg-primary text-primary-foreground rounded-full">
                      <Check size={16} />
                    </div>
                  )}
                </div>
                {showFees && fee > 0 && isAvailable && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Taxa: {fee}% (+R$ {feeAmount.toFixed(2)}) | Total: R${" "}
                    {finalAmount.toFixed(2)}
                  </div>
                )}
                {showFees && fee === 0 && isAvailable && (
                  <div className="mt-2 text-xs text-primary">
                    Sem taxa adicional | Total: R$ {finalAmount.toFixed(2)}
                  </div>
                )}
                {!isAvailable && (
                  <div className="mt-2 text-xs text-destructive">
                    {method.minAmount && totalAmount < method.minAmount
                      ? `Valor mínimo: R$ ${method.minAmount.toFixed(2)}`
                      : method.maxAmount && totalAmount > method.maxAmount
                        ? `Valor máximo: R$ ${method.maxAmount.toFixed(2)}`
                        : "Indisponível"}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
