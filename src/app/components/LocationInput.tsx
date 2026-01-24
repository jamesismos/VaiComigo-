import { MapPin, Navigation, X, Search } from "lucide-react";
import { useState, useEffect } from "react";

interface LocationInputProps {
  type: "origin" | "destination" | "stop";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onRemove?: () => void;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function LocationInput({
  type,
  value,
  onChange,
  placeholder,
  onRemove,
}: LocationInputProps) {
  const Icon = type === "origin" ? Navigation : MapPin;
  const [cep, setCep] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Função para buscar CEP via ViaCEP
  const fetchCep = async (cepValue: string) => {
    if (cepValue.length === 8 && /^\d+$/.test(cepValue)) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepValue}/json/`,
        );
        const data: ViaCepResponse = await response.json();
        if (!data.erro) {
          const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          setSuggestions([address]);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cep) fetchCep(cep);
    }, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [cep]);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setCep("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

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
      {/* Campo para CEP */}
      <div className="mt-2 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={cep}
          onChange={(e) =>
            setCep(e.target.value.replace(/\D/g, "").slice(0, 8))
          }
          placeholder="Digite o CEP para sugestão"
          className="w-full pl-12 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-card border border-border rounded-lg mt-1 max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-muted cursor-pointer"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
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
