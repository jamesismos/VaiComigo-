import { useState, useEffect } from "react";
import {
  Car,
  Clock,
  User,
  Menu,
  Plus,
  MapPin,
  Navigation,
  Star,
  Phone,
  X,
  CreditCard,
  Tag,
  History,
  Home,
  Package,
  ShoppingBag,
  Dog,
  ChevronRight,
  Minus,
  Smartphone,
  Check,
} from "lucide-react";
import { LocationInput } from "@/app/components/LocationInput";
import { MapComponent } from "@/app/components/MapPlaceholder";
import {
  PRICING_CONFIG,
  CategorySelection,
  Coupon,
  RideStatus,
  CategoryType,
  RegionType,
} from "@/app/config/pricing";
import {
  calculateRoute,
  calculatePrice,
  calculateFinalPrice,
  getCategoryDescription,
  validateCoupon,
} from "@/app/utils/calculations";
import Auth from "@/components/Auth";

export default function App() {
  // Estados principais
  const [screen, setScreen] = useState<
    | "home"
    | "ride-progress"
    | "rating"
    | "history"
    | "coupons"
    | "payment"
    | "login"
  >("home");
  const [showMenu, setShowMenu] = useState(false);
  const [forceMobile, setForceMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Estados de categoria
  const [categories, setCategories] = useState<CategorySelection>({
    passengers: 1,
    hasPet: false,
    isDelivery: false,
    isMarket: false,
    hasTrunk: false,
  });

  // Estado da região
  const [region, setRegion] = useState<RegionType>("vale-jequitinhonha");

  // Estados de geolocalização
  const [cep, setCep] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -18.5122, -44.555,
  ]); // Vale do Jequitinhonha

  // Estados da corrida
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: number;
  } | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Estados do fluxo
  const [rideStatus, setRideStatus] = useState<RideStatus>("idle");
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  // Mock de motorista
  const mockDriver = {
    id: 1,
    name: "Carlos Mendes",
    rating: 4.9,
    totalRides: 1247,
    car: "Honda Civic Prata",
    plate: "ABC-1234",
    photo: "👨‍💼",
    phone: "(31) 99999-9999",
  };

  // Mock de corridas anteriores
  const recentRides = [
    {
      id: 1,
      driver: "João Silva",
      from: "Shopping Center",
      to: "Rua das Flores, 123",
      price: 25.5,
      rating: 5,
      date: "20/01/2026",
      category: "passenger",
      passengers: 2,
      hasPet: false,
    },
    {
      id: 2,
      driver: "Maria Santos",
      from: "Aeroporto",
      to: "Hotel Central",
      price: 42.0,
      rating: 4,
      date: "18/01/2026",
      category: "passenger",
      passengers: 1,
      hasPet: true,
    },
    {
      id: 3,
      driver: "Pedro Costa",
      from: "Av. Principal, 500",
      to: "Supermercado Extra",
      price: 35.3,
      rating: 5,
      date: "15/01/2026",
      category: "market",
      passengers: 0,
      hasPet: false,
    },
  ];

  // Mock de cupons
  const coupons: Coupon[] = [
    {
      code: "PRIMEIRA",
      discount: 10,
      type: "percent",
      description: "10% OFF primeira corrida",
      minValue: 0,
    },
    {
      code: "VAIPET20",
      discount: 20,
      type: "percent",
      description: "20% OFF VaiPet",
      minValue: 15,
      categoryType: "pet" as CategoryType,
    },
    {
      code: "MERCADO15",
      discount: 15,
      type: "percent",
      description: "15% OFF VaiMercado",
      minValue: 20,
      categoryType: "market" as CategoryType,
    },
    {
      code: "FIXO5",
      discount: 5,
      type: "fixed",
      description: "R$5 OFF",
      minValue: 20,
    },
  ];

  // Calcular rota e preço quando os dados mudarem
  useEffect(() => {
    if (origin && destination) {
      const route = calculateRoute(origin, destination, stops.length);
      setRouteInfo(route);
      const price = calculatePrice(route, categories, stops.length, region);
      setTotalPrice(price);
    } else {
      setRouteInfo(null);
      setTotalPrice(0);
    }
  }, [origin, destination, stops, categories, region]);

  // Handlers de paradas
  const handleAddStop = () => {
    if (stops.length < 3) {
      setStops([...stops, ""]);
    }
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleUpdateStop = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  // Handler de CEP
  const handleCepChange = async (value: string) => {
    setCep(value);
    if (value.length === 8) {
      try {
        // Buscar dados do CEP via ViaCEP
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        if (!data.erro) {
          // Geocodificar a cidade usando Nominatim
          const cityQuery = `${data.localidade}, ${data.uf}, Brazil`;
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}`,
          );
          const geoData = await geoResponse.json();
          if (geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lon = parseFloat(geoData[0].lon);
            setMapCenter([lat, lon]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  // Handlers de categoria
  const handleCategoryChange = (type: CategoryType) => {
    if (type === "passenger") {
      setCategories({
        passengers: 1,
        hasPet: false,
        isDelivery: false,
        isMarket: false,
        hasTrunk: false,
      });
    } else if (type === "pet") {
      setCategories({
        ...categories,
        hasPet: !categories.hasPet,
        isDelivery: false,
        isMarket: false,
        hasTrunk: false,
      });
    } else if (type === "delivery") {
      setCategories({
        passengers: 0,
        hasPet: false,
        isDelivery: true,
        isMarket: false,
        hasTrunk: false,
      });
    } else if (type === "market") {
      setCategories({
        passengers: 1,
        hasPet: false,
        isDelivery: false,
        isMarket: true,
        hasTrunk: false,
      });
    }
  };

  const adjustPassengers = (delta: number) => {
    const newCount = Math.max(1, Math.min(4, categories.passengers + delta));
    setCategories({ ...categories, passengers: newCount });
  };

  // Handler de login
  const handleLogin = () => {
    // Simulação de login - em produção, implementar autenticação real
    setIsLoggedIn(true);
    setScreen("home");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setScreen("login");
  };

  // Handlers de corrida
  const handleRequestRide = () => {
    if (origin && destination && routeInfo) {
      setRideStatus("searching");
      setTimeout(() => {
        setRideStatus("accepted");
        setScreen("ride-progress");
      }, 2000);
    }
  };

  const handleStartRide = () => {
    setRideStatus("ongoing");
  };

  const handleCompleteRide = () => {
    setRideStatus("completed");
    setScreen("rating");
  };

  const handleSubmitRating = () => {
    // Reset
    setRideStatus("idle");
    setCategories({
      passengers: 1,
      hasPet: false,
      isDelivery: false,
      isMarket: false,
      hasTrunk: false,
    });
    setOrigin("");
    setDestination("");
    setStops([]);
    setRouteInfo(null);
    setTotalPrice(0);
    setAppliedCoupon(null);
    setRating(0);
    setRatingComment("");
    setScreen("home");
  };

  // Handlers de cupom
  const applyCoupon = (coupon: Coupon) => {
    const validation = validateCoupon(coupon, categories, totalPrice);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    setAppliedCoupon(coupon);
    setShowMenu(false);
    setScreen("home");
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Badge de status
  const RideStatusBadge = () => {
    const statusConfig = {
      searching: { text: "Procurando motorista...", color: "bg-muted" },
      accepted: { text: "Motorista a caminho", color: "bg-primary" },
      ongoing: { text: "Em andamento", color: "bg-primary" },
      completed: { text: "Corrida finalizada", color: "bg-muted" },
    };

    if (rideStatus === "idle") return null;

    const config = statusConfig[rideStatus];
    return (
      <div
        className={`${config.color} text-primary-foreground px-4 py-3 rounded-xl text-sm text-center mb-4`}
      >
        {config.text}
      </div>
    );
  };

  return (
    <div
      className={`w-full min-h-screen bg-background text-foreground flex flex-col force-mobile ${
        forceMobile ? "mobile-force-view" : ""
      }`}
    >
      <div className="mobile-content">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary rounded-lg">
                <Car className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h1 className="text-sm font-bold">VaiComigo</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Auth />
              <button
                onClick={() => setForceMobile(!forceMobile)}
                className={`p-1 hover:bg-muted rounded-lg transition-colors ${
                  forceMobile ? "bg-primary text-primary-foreground" : ""
                }`}
                aria-label="Forçar visualização mobile"
                title="Simular visualização mobile no navegador"
              >
                <Smartphone size={20} />
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
                aria-label="Menu"
              >
                {showMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Menu Lateral */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="fixed right-0 top-0 w-80 bg-card border-l border-border h-full z-50 shadow-2xl overflow-y-auto">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Menu</h2>
                  <button onClick={() => setShowMenu(false)}>
                    <X size={24} />
                  </button>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => {
                    setScreen("home");
                    setShowMenu(false);
                  }}
                  className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                >
                  <Home size={20} className="text-primary" />
                  <span>Início</span>
                </button>
                <button
                  onClick={() => {
                    setScreen("history");
                    setShowMenu(false);
                  }}
                  className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                >
                  <History size={20} className="text-primary" />
                  <span>Histórico</span>
                </button>
                <button
                  onClick={() => {
                    setScreen("coupons");
                    setShowMenu(false);
                  }}
                  className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                >
                  <Tag size={20} className="text-primary" />
                  <span>Cupons</span>
                </button>
                <button
                  onClick={() => {
                    setScreen("payment");
                    setShowMenu(false);
                  }}
                  className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                >
                  <CreditCard size={20} className="text-primary" />
                  <span>Pagamento</span>
                </button>
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMenu(false);
                    }}
                    className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                  >
                    <User size={20} className="text-primary" />
                    <span>Sair</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setScreen("login");
                      setShowMenu(false);
                    }}
                    className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                  >
                    <User size={20} className="text-primary" />
                    <span>Entrar</span>
                  </button>
                )}
              </nav>
            </div>
          </>
        )}

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {/* LOGIN */}
            {screen === "login" && (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-card p-8 rounded-2xl border border-border w-full max-w-md">
                  <div className="text-center mb-6">
                    <div className="p-3 bg-primary rounded-full w-fit mx-auto mb-4">
                      <User className="text-primary-foreground" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Entrar no VaiComigo</h2>
                    <p className="text-muted-foreground mt-2">
                      Faça login para solicitar corridas
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full p-3 bg-secondary rounded-lg border border-border"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Senha
                      </label>
                      <input
                        type="password"
                        className="w-full p-3 bg-secondary rounded-lg border border-border"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      onClick={handleLogin}
                      className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                    >
                      Entrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* HOME - Solicitar Corrida */}
            {screen === "home" && rideStatus === "idle" && (
              <>
                {/* Mapa (acima) */}
                <div className="h-64 md:h-96 lg:h-[600px] w-full">
                  <MapComponent center={mapCenter} />
                </div>

                <div className="p-4 space-y-4">
                  {/* Seleção de Categoria */}
                  <div className="bg-card p-6 rounded-2xl border border-border">
                    <h2 className="mb-4">Escolha seu serviço</h2>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* VaiComigo (Passageiros) */}
                      <button
                        onClick={() => handleCategoryChange("passenger")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          !categories.isDelivery && !categories.isMarket
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <User className="mx-auto mb-2 text-primary" size={32} />
                        <div className="font-bold text-sm">VaiComigo!</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Passageiros
                        </div>
                      </button>

                      {/* VaiPet */}
                      <button
                        onClick={() => handleCategoryChange("pet")}
                        disabled={categories.isDelivery || categories.isMarket}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          categories.hasPet &&
                          !categories.isDelivery &&
                          !categories.isMarket
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        } ${categories.isDelivery || categories.isMarket ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Dog className="mx-auto mb-2 text-primary" size={32} />
                        <div className="font-bold text-sm">VaiPet</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          +R$ {PRICING_CONFIG[region].petFee.toFixed(2)}
                        </div>
                      </button>

                      {/* VaiEntrega */}
                      <button
                        onClick={() => handleCategoryChange("delivery")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          categories.isDelivery
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Package
                          className="mx-auto mb-2 text-primary"
                          size={32}
                        />
                        <div className="font-bold text-sm">VaiEntrega</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Até 20kg
                        </div>
                      </button>

                      {/* VaiMercado */}
                      <button
                        onClick={() => handleCategoryChange("market")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          categories.isMarket
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <ShoppingBag
                          className="mx-auto mb-2 text-primary"
                          size={32}
                        />
                        <div className="font-bold text-sm">VaiMercado</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Compras
                        </div>
                      </button>
                    </div>

                    {/* Contador de Passageiros */}
                    {!categories.isDelivery && (
                      <div className="bg-secondary p-4 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Número de passageiros
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => adjustPassengers(-1)}
                            disabled={categories.passengers <= 1}
                            className="p-2 bg-muted rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-lg font-bold w-8 text-center">
                            {categories.passengers}
                          </span>
                          <button
                            onClick={() => adjustPassengers(1)}
                            disabled={categories.passengers >= 4}
                            className="p-2 bg-muted rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Opção Porta Malas */}
                    {categories.isMarket && (
                      <div className="bg-secondary p-4 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Usar porta malas (+R${" "}
                          {PRICING_CONFIG[region].trunkFee.toFixed(2)})
                        </span>
                        <button
                          onClick={() =>
                            setCategories({
                              ...categories,
                              hasTrunk: !categories.hasTrunk,
                            })
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            categories.hasTrunk
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {categories.hasTrunk ? (
                            <Check size={16} />
                          ) : (
                            <X size={16} />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Resumo da Seleção */}
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
                      <div className="text-sm text-center">
                        <span className="text-muted-foreground">
                          Selecionado:{" "}
                        </span>
                        <span className="font-bold text-primary">
                          {getCategoryDescription(categories)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Formulário de Endereços */}
                  <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                    <h2 className="mb-2">Para onde vamos?</h2>

                    {!isLoggedIn && (
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-muted-foreground mb-2">
                          Faça login para inserir endereços
                        </p>
                        <button
                          onClick={() => setScreen("login")}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                        >
                          Entrar
                        </button>
                      </div>
                    )}

                    {isLoggedIn && (
                      <>
                        {/* CEP */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            CEP
                          </label>
                          <input
                            type="text"
                            value={cep}
                            onChange={(e) =>
                              handleCepChange(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="00000-000"
                            maxLength={8}
                            className="w-full p-3 bg-secondary rounded-lg border border-border"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Digite o CEP para centralizar o mapa na cidade
                          </p>
                        </div>

                        <LocationInput
                          type="origin"
                          value={origin}
                          onChange={setOrigin}
                          placeholder="Endereço de origem"
                        />
                      </>
                    )}

                    {/* Paradas */}
                    {stops.map((stop, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-4 my-3">
                          <div className="flex-1 border-t border-border" />
                          <Clock className="text-muted-foreground" size={16} />
                          <div className="flex-1 border-t border-border" />
                        </div>
                        <LocationInput
                          type="stop"
                          value={stop}
                          onChange={(value) => handleUpdateStop(index, value)}
                          placeholder={`Parada ${index + 1}`}
                          onRemove={() => handleRemoveStop(index)}
                        />
                      </div>
                    ))}

                    {/* Adicionar Parada */}
                    {stops.length < 3 && (
                      <button
                        onClick={handleAddStop}
                        className="w-full py-3 border border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-primary transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        <span>
                          Adicionar parada (+R${" "}
                          {PRICING_CONFIG[region].stopPointFee.toFixed(2)})
                        </span>
                      </button>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex-1 border-t border-border" />
                      <Clock className="text-muted-foreground" size={16} />
                      <div className="flex-1 border-t border-border" />
                    </div>

                    <LocationInput
                      type="destination"
                      value={destination}
                      onChange={setDestination}
                      placeholder="Endereço de destino"
                    />

                    {/* Cupom Aplicado */}
                    {appliedCoupon && (
                      <div className="bg-primary/10 border border-primary rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag size={20} className="text-primary" />
                          <div>
                            <div className="text-sm font-bold">
                              {appliedCoupon.code}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {appliedCoupon.type === "percent"
                                ? `${appliedCoupon.discount}% OFF`
                                : `R$ ${appliedCoupon.discount} OFF`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}

                    {/* Resumo do Preço */}
                    {routeInfo && totalPrice > 0 && (
                      <div className="bg-secondary p-4 rounded-xl space-y-2 border border-border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Distância estimada
                          </span>
                          <span className="font-medium">
                            {routeInfo.distance} km
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tempo estimado
                          </span>
                          <span className="font-medium">
                            {routeInfo.duration} min
                          </span>
                        </div>

                        {stops.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {stops.length}{" "}
                              {stops.length === 1 ? "parada" : "paradas"}
                            </span>
                            <span className="font-medium">
                              +R${" "}
                              {(
                                stops.length *
                                PRICING_CONFIG[region].stopPointFee
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="border-t border-border pt-2 mt-2">
                          {appliedCoupon && (
                            <>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground line-through">
                                  Subtotal
                                </span>
                                <span className="line-through text-muted-foreground">
                                  R$ {totalPrice.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-primary">Desconto</span>
                                <span className="text-primary">
                                  - R${" "}
                                  {(
                                    totalPrice - calculateFinalPrice(totalPrice)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="font-bold">Total</span>
                            <span className="text-2xl font-bold text-primary">
                              R$ {calculateFinalPrice(totalPrice).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          ⓘ Preço fixo - não muda durante a corrida
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleRequestRide}
                      disabled={!origin || !destination || !routeInfo}
                      className="w-full bg-primary text-primary-foreground p-4 rounded-xl font-bold hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <Car size={20} />
                      <span>Confirmar e Chamar Motorista</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* CORRIDA EM ANDAMENTO */}
            {screen === "ride-progress" && rideStatus !== "idle" && (
              <div className="space-y-4 max-w-2xl mx-auto lg:col-span-2">
                <RideStatusBadge />

                {/* Info do Motorista */}
                {(rideStatus === "accepted" || rideStatus === "ongoing") && (
                  <div className="bg-card border border-border p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-6xl">{mockDriver.photo}</div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">{mockDriver.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star
                            size={16}
                            className="fill-current text-yellow-400"
                          />
                          <span>{mockDriver.rating}</span>
                          <span>•</span>
                          <span>{mockDriver.totalRides} corridas</span>
                        </div>
                        <div className="mt-2 text-sm">
                          <div className="font-medium">{mockDriver.car}</div>
                          <div className="text-muted-foreground">
                            {mockDriver.plate}
                          </div>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${mockDriver.phone}`}
                      className="flex items-center justify-center gap-2 bg-primary text-primary-foreground p-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Phone size={20} />
                      Ligar para o motorista
                    </a>
                  </div>
                )}

                {/* Rota */}
                <div className="bg-card border border-border p-6 rounded-2xl space-y-3">
                  <h3 className="font-bold mb-3">Rota</h3>
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="text-primary mt-1 flex-shrink-0"
                      size={20}
                    />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">
                        Origem
                      </div>
                      <div className="text-sm font-medium">{origin}</div>
                    </div>
                  </div>

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

                  <div className="flex items-start gap-3">
                    <Navigation
                      className="text-primary mt-1 flex-shrink-0"
                      size={20}
                    />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">
                        Destino
                      </div>
                      <div className="text-sm font-medium">{destination}</div>
                    </div>
                  </div>
                </div>

                {/* Categoria e Resumo */}
                <div className="bg-card border border-border p-6 rounded-2xl">
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">Serviço</div>
                    <div className="text-lg font-bold text-primary">
                      {getCategoryDescription(categories)}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Valor total</span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {calculateFinalPrice(totalPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                {rideStatus === "accepted" && (
                  <button
                    onClick={handleStartRide}
                    className="w-full bg-primary text-primary-foreground p-4 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                  >
                    Iniciar Corrida
                  </button>
                )}

                {rideStatus === "ongoing" && (
                  <button
                    onClick={handleCompleteRide}
                    className="w-full bg-primary text-primary-foreground p-4 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                  >
                    Finalizar Corrida
                  </button>
                )}
              </div>
            )}

            {/* AVALIAÇÃO */}
            {screen === "rating" && rideStatus === "completed" && (
              <div className="space-y-4 max-w-2xl mx-auto lg:col-span-2">
                <div className="bg-card border border-border p-6 rounded-2xl">
                  <h2 className="text-xl font-bold mb-6 text-center">
                    Como foi sua experiência?
                  </h2>

                  <div className="text-center mb-6">
                    <div className="text-6xl mb-3">{mockDriver.photo}</div>
                    <div className="text-lg font-medium">{mockDriver.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {mockDriver.car}
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 my-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={40}
                          className={
                            star <= rating
                              ? "fill-current text-yellow-400"
                              : "text-muted"
                          }
                        />
                      </button>
                    ))}
                  </div>

                  {rating > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Comentário (opcional)
                      </label>
                      <textarea
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Conte-nos sobre sua experiência..."
                        className="w-full bg-input-background border border-border rounded-xl p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                        rows={4}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSubmitRating}
                    disabled={rating === 0}
                    className="w-full bg-primary text-primary-foreground p-4 rounded-xl font-bold hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
                  >
                    Enviar Avaliação
                  </button>
                </div>
              </div>
            )}

            {/* HISTÓRICO */}
            {screen === "history" && (
              <div className="space-y-3 lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">
                  Histórico de Corridas
                </h2>
                {recentRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-card border border-border p-4 rounded-xl hover:border-primary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        {ride.category === "market" ? (
                          <ShoppingBag
                            size={24}
                            className="text-primary flex-shrink-0"
                          />
                        ) : ride.hasPet ? (
                          <Dog
                            size={24}
                            className="text-primary flex-shrink-0"
                          />
                        ) : (
                          <User
                            size={24}
                            className="text-primary flex-shrink-0"
                          />
                        )}
                        <div>
                          <div className="font-bold">{ride.driver}</div>
                          <div className="text-xs text-muted-foreground">
                            {ride.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star
                          size={16}
                          className="fill-current text-yellow-400"
                        />
                        <span className="text-sm font-medium">
                          {ride.rating}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={16}
                          className="text-primary flex-shrink-0"
                        />
                        <span className="text-muted-foreground truncate">
                          {ride.from}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation
                          size={16}
                          className="text-primary flex-shrink-0"
                        />
                        <span className="text-muted-foreground truncate">
                          {ride.to}
                        </span>
                      </div>
                    </div>

                    {/* Tags de Categoria */}
                    <div className="flex gap-2 mb-3">
                      {ride.category === "market" && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                          VaiMercado
                        </span>
                      )}
                      {ride.passengers > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                          {ride.passengers}{" "}
                          {ride.passengers === 1 ? "passageiro" : "passageiros"}
                        </span>
                      )}
                      {ride.hasPet && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                          VaiPet
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        Valor pago
                      </span>
                      <span className="font-bold text-primary">
                        R$ {ride.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CUPONS */}
            {screen === "coupons" && (
              <div className="space-y-3 lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">Cupons Disponíveis</h2>
                {coupons.map((coupon, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border p-4 rounded-xl hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Tag size={24} className="text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">{coupon.code}</div>
                          <div className="text-sm text-muted-foreground">
                            {coupon.description}
                          </div>
                          {coupon.minValue > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Valor mínimo: R$ {coupon.minValue.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => applyCoupon(coupon)}
                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <span className="text-sm">Aplicar</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGAMENTO */}
            {screen === "payment" && (
              <div className="space-y-4 lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">Formas de Pagamento</h2>
                <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
                  {/* Cartão de Crédito */}
                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                    <CreditCard size={24} className="text-primary" />
                    <div className="flex-1">
                      <div className="font-bold">Cartão de Crédito</div>
                      <div className="text-sm text-muted-foreground">
                        •••• •••• •••• 1234
                      </div>
                    </div>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Padrão
                    </span>
                  </div>

                  {/* Pix */}
                  <div className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors cursor-pointer">
                    <Smartphone size={24} className="text-green-600" />
                    <div className="flex-1">
                      <div className="font-bold">Pix</div>
                      <div className="text-sm text-muted-foreground">
                        Pagamento instantâneo
                      </div>
                    </div>
                  </div>

                  {/* Bitcoin */}
                  <div className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors cursor-pointer">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">₿</div>
                    <div className="flex-1">
                      <div className="font-bold">Bitcoin</div>
                      <div className="text-sm text-muted-foreground">
                        Criptomoeda
                      </div>
                    </div>
                  </div>

                  {/* Dinheiro */}
                  <div className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors cursor-pointer">
                    <Tag size={24} className="text-green-600" />
                    <div className="flex-1">
                      <div className="font-bold">Dinheiro</div>
                      <div className="text-sm text-muted-foreground">
                        Pague ao motorista
                      </div>
                    </div>
                  </div>

                  <button className="w-full p-4 border border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-primary transition-all flex items-center justify-center gap-2">
                    <Plus size={20} />
                    <span>Adicionar nova forma de pagamento</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border py-4 px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 VaiComigo - Mobilidade inteligente
          </p>
        </footer>
      </div>
    </div>
  );
}
