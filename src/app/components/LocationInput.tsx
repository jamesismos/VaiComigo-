import { MapPin, Navigation, X } from "lucide-react";

interface LocationInputProps {
  type: "origin" | "destination" | "stop";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onRemove?: () => void;
}

export function LocationInput({
  type,
  value,
  onChange,
  placeholder,
  onRemove,
}: LocationInputProps) {
  const Icon = type === "origin" ? Navigation : MapPin;

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
        <Icon size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      />
      {type === "stop" && onRemove && (
        <button
          onClick={onRemove}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Remover parada"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}