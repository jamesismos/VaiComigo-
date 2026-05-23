import { Star, Phone, Car } from "lucide-react";
import { Driver } from "@/types";

interface DriverCardProps {
  driver: Driver;
  onCall?: () => void;
  showCallButton?: boolean;
}

export function DriverCard({
  driver,
  onCall,
  showCallButton = true,
}: DriverCardProps) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-6xl">{driver.photo}</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{driver.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star
              size={16}
              className="fill-current text-yellow-400"
            />
            <span>{driver.rating}</span>
            <span>•</span>
            <span>{driver.totalRides} corridas</span>
          </div>
          <div className="mt-2 text-sm">
            <div className="font-medium flex items-center gap-2">
              <Car size={16} />
              {driver.car}
            </div>
            <div className="text-muted-foreground">
              {driver.plate}
            </div>
            <div className="text-muted-foreground">
              {driver.car_seats} assentos
            </div>
          </div>
        </div>
      </div>

      {showCallButton && (
        <a
          href={`tel:${driver.phone}`}
          onClick={onCall}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground p-3 rounded-xl font-medium hover:bg-primary/90 transition-colors w-full"
        >
          <Phone size={20} />
          Ligar para o motorista
        </a>
      )}
    </div>
  );
}
