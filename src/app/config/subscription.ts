import { SubscriptionPlan } from "@/types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Básico",
    description: "Ideal para começar",
    monthlyPrice: 99.90,
    features: [
      "Até 100 corridas/mês",
      "Comissão de 15%",
      "Suporte básico",
      "App para motorista",
    ],
    maxRidesPerMonth: 100,
    commissionRate: 15,
    supportLevel: "basic",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Mais corridas, menos comissão",
    monthlyPrice: 199.90,
    features: [
      "Até 300 corridas/mês",
      "Comissão de 12%",
      "Suporte prioritário",
      "App para motorista",
      "Relatórios avançados",
    ],
    maxRidesPerMonth: 300,
    commissionRate: 12,
    supportLevel: "priority",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Sem limites",
    monthlyPrice: 399.90,
    features: [
      "Corridas ilimitadas",
      "Comissão de 10%",
      "Suporte dedicado",
      "App para motorista",
      "Relatórios avançados",
      "API personalizada",
    ],
    commissionRate: 10,
    supportLevel: "dedicated",
  },
];

export function getSubscriptionPlan(planId: "basic" | "premium" | "enterprise"): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS[0];
}

export function calculateDriverEarnings(
  totalRideValue: number,
  commissionRate: number
): number {
  return totalRideValue * (1 - commissionRate / 100);
}

export function formatSubscriptionPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace(".", ",")}`;
}
