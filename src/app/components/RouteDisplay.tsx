import { MapPin, Navigation, Clock } from "lucide-react";

interface RouteDisplayProps {
  origin: string;
  destination: string;
  stops?: string[];
}

export function RouteDisplay({
  origin,
  destination,
  stops = [],
}: RouteDisplayProps) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl space-y-3">
      <h3 className="font-bold mb-3">Rota</h3>
      
      {/* Origem */}
      <div className="flex items-start gap-3">
        <MapPin
          className="text-primary mt-1 flex-shrink-0"
          size={20}
        />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Origem</div>
          <div className="text-sm font-medium">{origin}</div>
        </div>
      </div>

      {/* Paradas */}
      {stops.map(
        (stop, index) =>
          stop && (
            <div key={index} className="flex items-start gap-3">
              <Clock
                className="text-yellow-500 mt-1 flex-shrink-0"
                size={20}
              />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">
                  Parada {index + 1}
                </div>
                <div className="text-sm font-medium">{stop}</div>
              </div>
            </div>
          ),
      )}

      {/* Destino */}
      <div className="flex items-start gap-3">
        <Navigation
          className="text-primary mt-1 flex-shrink-0"
          size={20}
        />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Destino</div>
          <div className="text-sm font-medium">{destination}</div>
        </div>
      </div>
    </div>
  );
}
