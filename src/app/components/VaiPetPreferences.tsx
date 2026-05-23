import { useState } from "react";
import { ArrowLeft, User, Box, AlertTriangle, Info, Check } from "lucide-react";
import { useCategoryStore } from "@/store";

interface VaiPetPreferencesProps {
  onBack: () => void;
  onConfirm: () => void;
}

type TransportType = "box" | "guide" | null;
type PetSize = "small" | "medium" | "large" | null;

export function VaiPetPreferences({ onBack, onConfirm }: VaiPetPreferencesProps) {
  const categoryStore = useCategoryStore();
  const [transportType, setTransportType] = useState<TransportType>(null);
  const [petSize, setPetSize] = useState<PetSize>("medium");
  const [observations, setObservations] = useState("");

  const handleConfirm = () => {
    // Atualizar store com preferências
    categoryStore.setCategories({
      ...categoryStore.categories,
      hasPet: true,
      passengers: 1, // VaiPet sempre requer 1 passageiro
    });
    onConfirm();
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Preferências VaiPet</h1>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Seção: 1 Passageiro + Pet */}
        <div className="bg-primary/20 border-2 border-primary rounded-2xl p-4">
          <div className="flex items-start gap-4">
            <div className="flex gap-2">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User size={24} className="text-primary-foreground" />
              </div>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-primary-foreground"
                >
                  <path
                    d="M8.5 8.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zm7 0c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zm-3.5 4c-2.33 0-7 1.17-7 3.5V19h14v-3c0-2.33-4.67-3.5-7-3.5z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">1 Passageiro + Pet</h2>
              <p className="text-sm text-muted-foreground">
                O pet deve estar acompanhado por um responsável.
              </p>
            </div>
          </div>
        </div>

        {/* Tipo de Transporte */}
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-bold mb-1">Tipo de Transporte</h3>
            <p className="text-sm text-muted-foreground">
              Sempre acompanhado por 1 passageiro
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTransportType("box")}
              className={`p-4 rounded-xl border-2 transition-all ${
                transportType === "box"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <User size={20} />
                <Box size={20} />
              </div>
              <div className="font-bold text-sm">NA CAIXA</div>
            </button>
            <button
              onClick={() => setTransportType("guide")}
              className={`p-4 rounded-xl border-2 transition-all ${
                transportType === "guide"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <User size={20} />
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M8.5 8.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zm7 0c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zm-3.5 4c-2.33 0-7 1.17-7 3.5V19h14v-3c0-2.33-4.67-3.5-7-3.5z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="font-bold text-sm">COM GUIA</div>
            </button>
          </div>
        </div>

        {/* Porte do Pet */}
        <div className="space-y-3">
          <h3 className="text-base font-bold">Porte do Pet</h3>
          <div className="grid grid-cols-3 gap-3">
            {(["small", "medium", "large"] as const).map((size) => {
              const labels = {
                small: "Pequeno",
                medium: "Médio",
                large: "Grande",
              };
              return (
                <button
                  key={size}
                  onClick={() => setPetSize(size)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    petSize === size
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-bold text-sm">{labels[size]}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-3">
          <h3 className="text-base font-bold">
            Alguma observação para o motorista?
          </h3>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex: Meu pet é um pouco agitado..."
            className="w-full p-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
          />
        </div>

        {/* Mensagens de Aviso */}
        <div className="space-y-3">
          {/* Aviso */}
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={24}
                className="text-orange-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-foreground">
                O transporte de pets requer obrigatoriamente a presença de um
                responsável durante todo o trajeto.
              </p>
            </div>
          </div>

          {/* Informação */}
          <div className="bg-primary/20 border border-primary/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info size={24} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Certifique-se de que o animal esteja limpo e seguro para o
                conforto de todos.
              </p>
            </div>
          </div>
        </div>

        {/* Adicional VaiPet */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Adicional VaiPet</h3>
              <p className="text-sm text-muted-foreground">
                (1 PASSAGEIRO INCLUSO)
              </p>
            </div>
            <div className="text-primary font-bold text-lg">+ R$ 8,00</div>
          </div>
        </div>
      </main>

      {/* Botão de Confirmar */}
      <footer className="bg-card border-t border-border p-4 sticky bottom-0">
        <button
          onClick={handleConfirm}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <span>Confirmar Preferências</span>
          <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Check size={16} className="text-primary-foreground" />
          </div>
        </button>
      </footer>
    </div>
  );
}
