import { AlertTriangle, Ban, CheckCircle2, ClipboardList, MapPinned, WalletCards } from "lucide-react";
import { getInitialCity } from "@/domains/cities/cityConfig";
import { formatCurrency } from "@/app/utils/calculations";

const city = getInitialCity();

const adminMetrics = [
  { label: "Cidade ativa", value: `${city.name} - ${city.state}`, icon: MapPinned },
  { label: "Taxa plataforma", value: `${city.platformFeePercent}%`, icon: WalletCards },
  { label: "Paradas maximas", value: String(city.maxStops), icon: ClipboardList },
  { label: "Raio operacional", value: `${city.serviceRadiusKm} km`, icon: AlertTriangle },
];

export function AdminDashboard() {
  return (
    <section className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold">Painel admin minimo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Operacao limitada a Padre Paraiso. Acoes reais devem chamar Edge Functions/RPC com role admin.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {adminMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Icon className="text-primary" size={22} />
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="font-bold">{metric.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-bold">Fila de motoristas</h3>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="font-medium">Cadastro pendente</p>
            <p className="text-sm text-muted-foreground">Validar CNH, veiculo, placa, cidade e chave Pix.</p>
          </div>
          <div className="flex gap-2">
            <button className="p-3 rounded-lg bg-primary text-primary-foreground" aria-label="Aprovar motorista">
              <CheckCircle2 size={18} />
            </button>
            <button className="p-3 rounded-lg border border-[#8B2E2E] text-[#ffb4ab]" aria-label="Bloquear motorista">
              <Ban size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <h3 className="font-bold">Carteira e recargas</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Saldo minimo recomendado</span>
          <span>{formatCurrency(20)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Limite negativo padrao</span>
          <span>{formatCurrency(-30)}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-bold">Alertas antifraude</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Monitorar distancia impossivel, cancelamentos excessivos, GPS suspeito e repeticao anormal de corridas.
        </p>
      </div>
    </section>
  );
}
