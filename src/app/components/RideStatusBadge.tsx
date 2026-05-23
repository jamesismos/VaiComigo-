import { RideStatus } from "@/types";
import { Loader2, Car, CheckCircle2, Clock } from "lucide-react";

interface RideStatusBadgeProps {
  status: RideStatus;
}

const statusConfig = {
  searching: {
    text: "Procurando motorista...",
    color: "bg-muted",
    icon: Loader2,
  },
  accepted: {
    text: "Motorista a caminho",
    color: "bg-primary",
    icon: Car,
  },
  ongoing: {
    text: "Em andamento",
    color: "bg-primary",
    icon: Clock,
  },
  completed: {
    text: "Corrida finalizada",
    color: "bg-muted",
    icon: CheckCircle2,
  },
};

export function RideStatusBadge({ status }: RideStatusBadgeProps) {
  if (status === "idle") return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`${config.color} text-primary-foreground px-4 py-3 rounded-xl text-sm text-center mb-4 flex items-center justify-center gap-2`}
    >
      <Icon
        size={18}
        className={status === "searching" ? "animate-spin" : ""}
      />
      <span>{config.text}</span>
    </div>
  );
}
