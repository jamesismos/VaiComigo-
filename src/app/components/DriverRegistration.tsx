import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Car,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  ArrowRight,
} from "lucide-react";
import { DriverRegistration as DriverRegistrationType, SubscriptionPlan } from "@/types";
import { SUBSCRIPTION_PLANS } from "@/app/config/subscription";

interface DriverRegistrationProps {
  onSubmit: (data: DriverRegistrationType) => void;
  onCancel: () => void;
}

export function DriverRegistration({ onSubmit, onCancel }: DriverRegistrationProps) {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "enterprise">("basic");
  const [formData, setFormData] = useState<Partial<DriverRegistrationType>>({
    subscriptionPlan: "basic",
    registrationStatus: "draft",
    subscriptionStatus: "pending",
  });

  const updateField = (field: keyof DriverRegistrationType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.phone) {
      onSubmit(formData as DriverRegistrationType);
    }
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const formatZipCode = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 8) {
      return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Cadastro de Motorista</h1>
          <p className="text-muted-foreground">
            Complete seu cadastro para começar a trabalhar com o VaiComigo
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step >= s
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {step > s ? (
                    <CheckCircle size={20} />
                  ) : (
                    <span className="font-bold">{s}</span>
                  )}
                </div>
                {s < 5 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > s ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Dados Pessoais</span>
            <span>Endereço</span>
            <span>Documentos</span>
            <span>Veículo</span>
            <span>Assinatura</span>
          </div>
        </div>

        {/* Step 1: Dados Pessoais */}
        {step === 1 && (
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User size={24} className="text-primary" />
              Dados Pessoais
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">Nome Completo *</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Seu nome completo"
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="seu@email.com"
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone *</label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => updateField("phone", formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CPF *</label>
              <input
                type="text"
                value={formData.cpf || ""}
                onChange={(e) => updateField("cpf", formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Data de Nascimento *</label>
              <input
                type="date"
                value={formData.birthDate || ""}
                onChange={(e) => updateField("birthDate", e.target.value)}
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Endereço */}
        {step === 2 && (
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin size={24} className="text-primary" />
              Endereço
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">CEP *</label>
              <input
                type="text"
                value={formData.zipCode || ""}
                onChange={(e) => updateField("zipCode", formatZipCode(e.target.value))}
                placeholder="00000-000"
                maxLength={9}
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Endereço *</label>
              <input
                type="text"
                value={formData.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Rua, número, complemento"
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cidade *</label>
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Cidade"
                  className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado *</label>
                <select
                  value={formData.state || ""}
                  onChange={(e) => updateField("state", e.target.value)}
                  className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  {/* Adicione mais estados */}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documentos */}
        {step === 3 && (
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText size={24} className="text-primary" />
              Documentos
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">Número da CNH *</label>
              <input
                type="text"
                value={formData.cnhNumber || ""}
                onChange={(e) => updateField("cnhNumber", e.target.value)}
                placeholder="00000000000"
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoria da CNH *</label>
              <select
                value={formData.cnhCategory || ""}
                onChange={(e) => updateField("cnhCategory", e.target.value)}
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Selecione</option>
                <option value="A">A - Motocicleta</option>
                <option value="B">B - Carro</option>
                <option value="C">C - Caminhão</option>
                <option value="D">D - Ônibus</option>
                <option value="E">E - Carreta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Validade da CNH *</label>
              <input
                type="date"
                value={formData.cnhExpiryDate || ""}
                onChange={(e) => updateField("cnhExpiryDate", e.target.value)}
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Foto da CNH *</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique para fazer upload da foto da CNH
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="cnh-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Aqui você faria o upload real
                      updateField("cnhPhoto", URL.createObjectURL(file));
                    }
                  }}
                />
                <label
                  htmlFor="cnh-upload"
                  className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  Selecionar Arquivo
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Veículo */}
        {step === 4 && (
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Car size={24} className="text-primary" />
              Dados do Veículo
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Marca *</label>
                <input
                  type="text"
                  value={formData.vehicleBrand || ""}
                  onChange={(e) => updateField("vehicleBrand", e.target.value)}
                  placeholder="Ex: Honda"
                  className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Modelo *</label>
                <input
                  type="text"
                  value={formData.vehicleModel || ""}
                  onChange={(e) => updateField("vehicleModel", e.target.value)}
                  placeholder="Ex: Civic"
                  className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ano *</label>
                <input
                  type="number"
                  value={formData.vehicleYear || ""}
                  onChange={(e) => updateField("vehicleYear", parseInt(e.target.value))}
                  placeholder="2020"
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cor *</label>
                <input
                  type="text"
                  value={formData.vehicleColor || ""}
                  onChange={(e) => updateField("vehicleColor", e.target.value)}
                  placeholder="Ex: Prata"
                  className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Assentos *</label>
                <input
                  type="number"
                  value={formData.vehicleSeats || ""}
                  onChange={(e) => updateField("vehicleSeats", parseInt(e.target.value))}
                  placeholder="4"
                  min="2"
                  max="8"
                  className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Placa *</label>
              <input
                type="text"
                value={formData.vehiclePlate || ""}
                onChange={(e) => updateField("vehiclePlate", e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                maxLength={8}
                className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Foto do Veículo *</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique para fazer upload da foto do veículo
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="vehicle-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      updateField("vehiclePhoto", URL.createObjectURL(file));
                    }
                  }}
                />
                <label
                  htmlFor="vehicle-upload"
                  className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  Selecionar Arquivo
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Assinatura Mensal */}
        {step === 5 && (
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard size={24} className="text-primary" />
              Escolha seu Plano Mensal
            </h2>

            <div className="space-y-4">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    updateField("subscriptionPlan", plan.id);
                  }}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        R$ {plan.monthlyPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">/mês</div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle
                          size={16}
                          className={`${
                            selectedPlan === plan.id ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Comissão do App:</span>
                      <span className="font-bold">{plan.commissionRate}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Importante:</p>
                  <p className="text-muted-foreground">
                    O pagamento da assinatura será cobrado mensalmente. Você pode cancelar a
                    qualquer momento. Após o pagamento, seu cadastro será analisado e você
                    receberá uma resposta em até 48 horas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-card border border-border text-foreground py-3 rounded-xl font-bold hover:bg-muted transition-colors"
            >
              Voltar
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Próximo
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Finalizar Cadastro
              <CheckCircle size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
