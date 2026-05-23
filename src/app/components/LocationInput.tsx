import { useEffect, useRef, useState } from "react";
import { Locate, MapPin, Navigation, X } from "lucide-react";
import { useGeolocation } from "../hooks/useGeolocation";
import {
  reverseMapboxGeocode,
  searchMapboxAddresses,
  type RouteStop,
  type ValidatedAddress,
} from "@/domains/maps/mapboxService";

interface LocationInputProps {
  type: "origin" | "destination" | "stop";
  value: string;
  onChange: (value: string) => void;
  onValidatedChange?: (value: RouteStop | null) => void;
  placeholder: string;
  onRemove?: () => void;
}

export function LocationInput({
  type,
  value,
  onChange,
  onValidatedChange,
  placeholder,
  onRemove,
}: LocationInputProps) {
  const Icon = type === "origin" ? Navigation : MapPin;
  const { getCurrentPosition } = useGeolocation();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<ValidatedAddress[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchTimeout = window.setTimeout(async () => {
      if (value.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        setError(null);
        onValidatedChange?.(null);
        return;
      }

      setIsSearching(true);
      setError(null);
      try {
        const results = await searchMapboxAddresses(value, 5);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        if (results.length === 0) {
          onValidatedChange?.(null);
          setError("Endereco nao validado. Escolha uma sugestao do Mapbox.");
        }
      } catch (searchError) {
        setSuggestions([]);
        setShowSuggestions(false);
        onValidatedChange?.(null);
        setError(searchError instanceof Error ? searchError.message : "Falha ao buscar endereco.");
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(searchTimeout);
  }, [onValidatedChange, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectAddress = (address: ValidatedAddress) => {
    onChange(address.fullAddress);
    onValidatedChange?.({ ...address, kind: type });
    setShowSuggestions(false);
    setSuggestions([]);
    setError(address.confidence === "low" ? "Confirme se este endereco esta correto antes de continuar." : null);
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    setError(null);
    try {
      const position = await getCurrentPosition();
      const address = await reverseMapboxGeocode({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      selectAddress(address);
    } catch (locationError) {
      onValidatedChange?.(null);
      setError(
        locationError instanceof Error
          ? locationError.message
          : "Nao foi possivel obter sua localizacao.",
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={`${type}-input`}>
        {placeholder}
      </label>
      <div className="absolute left-4 top-7 -translate-y-1/2 text-primary z-10">
        <Icon size={20} />
      </div>
      <input
        id={`${type}-input`}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          onValidatedChange?.(null);
        }}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${type}-error` : undefined}
        className="w-full pl-12 pr-20 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      />
      <div className="absolute right-4 top-7 -translate-y-1/2 flex items-center gap-2 z-10">
        {type !== "stop" && (
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Usar minha localizacao atual"
            title="Usar minha localizacao"
          >
            <Locate size={18} className={isGettingLocation ? "animate-spin" : ""} />
          </button>
        )}
        {type === "stop" && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Remover parada"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {isSearching && <div className="p-3 text-sm text-muted-foreground text-center">Buscando...</div>}
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion.id}
              onClick={() => selectAddress(suggestion)}
              className="w-full text-left p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{suggestion.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{suggestion.fullAddress}</div>
                  {suggestion.confidence === "low" && (
                    <div className="text-xs text-primary mt-1">Confirmacao recomendada</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p id={`${type}-error`} className="mt-2 text-xs text-[#ffb4ab]">
          {error}
        </p>
      )}
    </div>
  );
}
