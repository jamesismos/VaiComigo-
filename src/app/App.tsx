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
  MessageCircle,
  ClipboardList,
} from "lucide-react";
import { LocationInput } from "@/app/components/LocationInput";
import { Map } from "@/app/components/Map";
import { PaymentMethods } from "@/app/components/PaymentMethods";
import { DriverCard } from "@/app/components/DriverCard";
import { RideStatusBadge } from "@/app/components/RideStatusBadge";
import { RouteDisplay } from "@/app/components/RouteDisplay";
import { Chat } from "@/app/components/Chat";
import { VaiPetPreferences } from "@/app/components/VaiPetPreferences";
import { BottomNavigation } from "@/app/components/BottomNavigation";
import { DriverRegistration } from "@/app/components/DriverRegistration";
import { AdminDashboard } from "@/domains/admin/AdminDashboard";
import {
  PRICING_CONFIG,
  CategorySelection,
  Coupon,
  RideStatus,
  CategoryType,
  RegionType,
  getPricingForCity,
} from "@/app/config/pricing";
import {
  calculateRoute,
  calculatePrice,
  calculateFinalPrice,
  getCategoryDescription,
  validateCoupon,
} from "@/app/utils/calculations";
import Auth from "@/components/Auth";
import { useLocationStore, useCategoryStore, useRideStore, useDriverStore } from "@/store";
import { Driver } from "@/types";
import { getInitialCity, validateRouteInsideCity } from "@/domains/cities/cityConfig";
import type { RouteStop } from "@/domains/maps/mapboxService";

export default function App() {
  // Stores Zustand
  const locationStore = useLocationStore();
  const categoryStore = useCategoryStore();
  const rideStore = useRideStore();
  const driverStore = useDriverStore();

  // Estados principais
  const [screen, setScreen] = useState<
    | "home"
    | "ride-progress"
    | "rating"
    | "history"
    | "coupons"
    | "payment"
    | "login"
    | "chat"
    | "vaipet-preferences"
    | "driver-registration"
    | "admin"
  >("home");
  const [showMenu, setShowMenu] = useState(false);
  const [forceMobile, setForceMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Estados locais (para compatibilidade durante migração)
  const [cep, setCep] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -18.5122, -44.555,
  ]); // Vale do Jequitinhonha
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const [validatedOrigin, setValidatedOrigin] = useState<RouteStop | null>(null);
  const [validatedDestination, setValidatedDestination] = useState<RouteStop | null>(null);
  const [validatedStops, setValidatedStops] = useState<Array<RouteStop | null>>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: number;
    distanceKm?: number;
  } | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<GeoJSON.LineString | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  // Usar stores
  const categories = categoryStore.categories;
  const region = categoryStore.region;
  const rideStatus = rideStore.currentRide?.status || "idle";

  // Obter preços baseado na localização (origem ou destino)
  const pricingConfig = origin || destination
    ? getPricingForCity(origin || destination)
    : PRICING_CONFIG;

  // Mock de motorista (convertido para tipo Driver)
  const mockDriver: Driver = {
    id: 1,
    name: "Carlos Mendes",
    rating: 4.9,
    totalRides: 1247,
    car: "Honda Civic Prata",
    plate: "ABC-1234",
    photo: "👨‍💼",
    phone: "(31) 99999-9999",
    price: 0,
    time: 0,
    car_seats: 4,
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
    let cancelled = false;

    const updateRouteAndPrice = async () => {
      if (!validatedOrigin || !validatedDestination) {
        setRouteInfo(null);
        setRouteGeometry(null);
        setTotalPrice(0);
        setRouteError(origin || destination ? "Selecione origem e destino validados pelo Mapbox." : null);
        return;
      }

      const selectedStops = validatedStops.filter(Boolean) as RouteStop[];
      const points = [validatedOrigin, ...selectedStops, validatedDestination];
      const city = getInitialCity();
      const cityValidation = validateRouteInsideCity(city, points);

      if (!cityValidation.valid) {
        setRouteInfo(null);
        setRouteGeometry(null);
        setTotalPrice(0);
        setRouteError(cityValidation.message ?? "Corrida fora da area ativa.");
        return;
      }

      try {
        setRouteError(null);
        const route = await calculateRoute(points);
        if (cancelled) return;
        setRouteInfo(route);
        setRouteGeometry(route.geometry);
        setTotalPrice(calculatePrice(route, categories, selectedStops.length));
      } catch (error) {
        if (cancelled) return;
        setRouteInfo(null);
        setRouteGeometry(null);
        setTotalPrice(0);
        setRouteError(error instanceof Error ? error.message : "Nao foi possivel calcular a rota real.");
      }
    };

    void updateRouteAndPrice();

    return () => {
      cancelled = true;
    };
  }, [origin, destination, validatedOrigin, validatedDestination, validatedStops, categories]);

  // Handlers de paradas
  const handleAddStop = () => {
    if (stops.length < 3) {
      setStops([...stops, ""]);
      setValidatedStops([...validatedStops, null]);
    }
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
    setValidatedStops(validatedStops.filter((_, i) => i !== index));
  };

  const handleUpdateStop = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const handleValidatedStop = (index: number, value: RouteStop | null) => {
    const newStops = [...validatedStops];
    newStops[index] = value;
    setValidatedStops(newStops);
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

  // Handlers de categoria (usando store)
  const handleCategoryChange = (type: CategoryType) => {
    if (type === "passenger") {
      categoryStore.setCategories({
        passengers: 1,
        hasPet: false,
        isDelivery: false,
        isMarket: false,
        hasTrunk: false,
      });
    } else if (type === "pet") {
      categoryStore.setCategories({
        ...categories,
        hasPet: !categories.hasPet,
        isDelivery: false,
        isMarket: false,
        hasTrunk: false,
      });
    } else if (type === "delivery") {
      categoryStore.setCategories({
        passengers: 0,
        hasPet: false,
        isDelivery: true,
        isMarket: false,
        hasTrunk: false,
      });
    } else if (type === "market") {
      categoryStore.setCategories({
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
    categoryStore.setCategories({ ...categories, passengers: newCount });
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

  // Handlers de corrida (usando store)
  const handleRequestRide = () => {
    if (validatedOrigin && validatedDestination && routeInfo && totalPrice > 0) {
      rideStore.updateRideStatus("searching");
      rideStore.setRideDriver(mockDriver);
      setTimeout(() => {
        rideStore.updateRideStatus("accepted");
        setScreen("ride-progress");
      }, 2000);
    }
  };

  const handleStartRide = () => {
    rideStore.updateRideStatus("ongoing");
  };

  const handleCompleteRide = () => {
    rideStore.updateRideStatus("completed");
    setScreen("rating");
  };

  const handleSubmitRating = () => {
    // Reset usando stores
    rideStore.clearCurrentRide();
    categoryStore.resetCategories();
    locationStore.clearAll();
    setOrigin("");
    setDestination("");
    setStops([]);
    setValidatedOrigin(null);
    setValidatedDestination(null);
    setValidatedStops([]);
    setRouteInfo(null);
    setRouteGeometry(null);
    setRouteError(null);
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


  return (
    <div
      className={`w-full min-h-screen bg-background text-foreground flex flex-col force-mobile ${
        forceMobile ? "mobile-force-view" : ""
      }`}
      style={{
        backgroundColor: '#0B0B0B',
        color: '#ECECEC',
        minHeight: '100vh',
      }}
    >
      <div className="mobile-content">
        {/* Header Fixo com Backdrop Blur */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center p-4 pb-2 justify-between">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-foreground flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center font-display">
              VaiComigo
            </h2>
            <div className="flex w-12 items-center justify-end">
              <Auth />
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
                <button
                  onClick={() => {
                    setScreen("admin");
                    setShowMenu(false);
                  }}
                  className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                >
                  <ClipboardList size={20} className="text-primary" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={() => {
                    setScreen("chat");
                    setShowMenu(false);
                  }}
                  className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                >
                  <MessageCircle size={20} className="text-primary" />
                  <span>Chat</span>
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Tela de Preferências VaiPet */}
            {screen === "vaipet-preferences" ? (
              <VaiPetPreferences
                onBack={() => setScreen("home")}
                onConfirm={() => {
                  setScreen("home");
                }}
              />
            ) : (
              <>
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

            {/* HOME - Solicitar Corrida - Layout Mobile-First */}
            {screen === "home" && rideStatus === "idle" && (
              <div className="w-full">
                {/* Mapa no Topo */}
                <div className="relative w-full h-[45vh] mt-16">
                  <div className="w-full h-full">
                    <Map
                      routePoints={[
                        ...(validatedOrigin ? [validatedOrigin] : []),
                        ...(validatedStops.filter(Boolean) as RouteStop[]),
                        ...(validatedDestination ? [validatedDestination] : []),
                      ]}
                      routeGeometry={routeGeometry}
                      onLocationSelect={(point) => {
                        if (!origin) {
                          setOrigin(point.fullAddress);
                          setValidatedOrigin({ ...point, kind: "origin" });
                        } else if (!destination) {
                          setDestination(point.fullAddress);
                          setValidatedDestination({ ...point, kind: "destination" });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Conteúdo Principal com Rounded Top */}
                <div className="relative -mt-6 bg-background rounded-t-3xl flex-1 px-4 pt-6 pb-40">
                  {/* Handle Bar */}
                  <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-6"></div>

                  {/* Input de Busca */}
                  <div className="space-y-3 mb-6">
                    <LocationInput
                      type="origin"
                      value={origin}
                      onChange={setOrigin}
                      onValidatedChange={(value) =>
                        setValidatedOrigin(value ? { ...value, kind: "origin" } : null)
                      }
                      placeholder="Origem em Padre Paraiso"
                    />
                    <LocationInput
                      type="destination"
                      value={destination}
                      onChange={setDestination}
                      onValidatedChange={(value) =>
                        setValidatedDestination(value ? { ...value, kind: "destination" } : null)
                      }
                      placeholder="Para onde vamos?"
                    />
                    {stops.map((stop, index) => (
                      <LocationInput
                        key={index}
                        type="stop"
                        value={stop}
                        onChange={(value) => handleUpdateStop(index, value)}
                        onValidatedChange={(value) =>
                          handleValidatedStop(index, value ? { ...value, kind: "stop" } : null)
                        }
                        placeholder={`Parada ${index + 1}`}
                        onRemove={() => handleRemoveStop(index)}
                      />
                    ))}
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddStop}
                        disabled={stops.length >= 3}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 text-primary gap-2 text-sm font-bold leading-normal hover:bg-primary/20 transition-colors"
                      >
                        <Plus size={18} />
                        <span className="truncate">Parada</span>
                      </button>
                    </div>
                  </div>

                  {/* Nossos Serviços - Cards Horizontais */}
                  <div className="mt-8">
                    <h3 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] mb-4 font-display">
                      Nossos Serviços
                    </h3>

                    {/* Cards de Serviços - Scroll Horizontal */}
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1">
                      {/* VaiComigo (Passageiros) */}
                      <button
                        onClick={() => handleCategoryChange("passenger")}
                        className={`flex flex-col items-center justify-between min-w-[100px] aspect-[4/5] p-3 rounded-2xl border-2 transition-all ${
                          !categories.isDelivery && !categories.isMarket
                            ? "bg-primary border-primary shadow-xl"
                            : "bg-card border-transparent hover:border-primary/50"
                        }`}
                      >
                        <Car
                          className={`${
                            !categories.isDelivery && !categories.isMarket
                              ? "text-white"
                              : "text-primary"
                          }`}
                          size={32}
                        />
                        <span
                          className={`text-xs font-bold text-center ${
                            !categories.isDelivery && !categories.isMarket
                              ? "text-white"
                              : "text-foreground"
                          }`}
                        >
                          VaiComigo!
                        </span>
                        <span
                          className={`text-[10px] ${
                            !categories.isDelivery && !categories.isMarket
                              ? "text-white/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          1-4 pessoas
                        </span>
                      </button>

                      {/* VaiPet */}
                      <button
                        onClick={() => setScreen("vaipet-preferences")}
                        disabled={categories.isDelivery || categories.isMarket}
                        className={`flex flex-col items-center justify-between min-w-[100px] aspect-[4/5] p-3 rounded-2xl border-2 transition-all ${
                          categories.hasPet &&
                          !categories.isDelivery &&
                          !categories.isMarket
                            ? "bg-primary border-primary shadow-xl"
                            : "bg-card border-transparent hover:border-primary/50"
                        } ${categories.isDelivery || categories.isMarket ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-center -space-x-2">
                          <User
                            size={20}
                            className={`${
                              categories.hasPet &&
                              !categories.isDelivery &&
                              !categories.isMarket
                                ? "text-white"
                                : "text-primary"
                            }`}
                          />
                          <Dog
                            size={20}
                            className={`${
                              categories.hasPet &&
                              !categories.isDelivery &&
                              !categories.isMarket
                                ? "text-white"
                                : "text-primary"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold text-center ${
                            categories.hasPet &&
                            !categories.isDelivery &&
                            !categories.isMarket
                              ? "text-white"
                              : "text-foreground"
                          }`}
                        >
                          Passageiro + Pet
                        </span>
                        <span
                          className={`text-[10px] ${
                            categories.hasPet &&
                            !categories.isDelivery &&
                            !categories.isMarket
                              ? "text-white/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          Amigável a pets
                        </span>
                      </button>

                      {/* VaiEntrega */}
                      <button
                        onClick={() => handleCategoryChange("delivery")}
                        className={`flex flex-col items-center justify-between min-w-[100px] aspect-[4/5] p-3 rounded-2xl border-2 transition-all ${
                          categories.isDelivery
                            ? "bg-primary border-primary shadow-xl"
                            : "bg-card border-transparent hover:border-primary/50"
                        }`}
                      >
                        <Package
                          className={`${
                            categories.isDelivery ? "text-white" : "text-primary"
                          }`}
                          size={32}
                        />
                        <span
                          className={`text-xs font-bold text-center ${
                            categories.isDelivery ? "text-white" : "text-foreground"
                          }`}
                        >
                          VaiEntrega
                        </span>
                        <span
                          className={`text-[10px] ${
                            categories.isDelivery
                              ? "text-white/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          Entregas
                        </span>
                      </button>

                      {/* VaiMercado */}
                      <button
                        onClick={() => handleCategoryChange("market")}
                        className={`flex flex-col items-center justify-between min-w-[100px] aspect-[4/5] p-3 rounded-2xl border-2 transition-all ${
                          categories.isMarket
                            ? "bg-primary border-primary shadow-xl"
                            : "bg-card border-transparent hover:border-primary/50"
                        }`}
                      >
                        <ShoppingBag
                          className={`${
                            categories.isMarket ? "text-white" : "text-primary"
                          }`}
                          size={32}
                        />
                        <span
                          className={`text-xs font-bold text-center ${
                            categories.isMarket ? "text-white" : "text-foreground"
                          }`}
                        >
                          VaiMercado
                        </span>
                        <span
                          className={`text-[10px] ${
                            categories.isMarket
                              ? "text-white/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          Mercado
                        </span>
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
                          {pricingConfig.trunkFee.toFixed(2)})
                        </span>
                        <button
                          onClick={() =>
                            categoryStore.setCategories({
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

                  </div>

                  {/* Histórico de Endereços */}
                  <div className="mt-4 space-y-0">
                    <div className="flex items-center gap-4 py-2 cursor-pointer hover:bg-card/50 rounded-lg px-2 transition-colors">
                      <div className="size-10 rounded-full bg-card flex items-center justify-center text-muted-foreground">
                        <History size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">Av. Paulista, 1000</p>
                        <p className="text-xs text-muted-foreground">Bela Vista, São Paulo</p>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4 py-2 border-t border-border cursor-pointer hover:bg-card/50 rounded-lg px-2 transition-colors">
                      <div className="size-10 rounded-full bg-card flex items-center justify-center text-muted-foreground">
                        <Home size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">Casa</p>
                        <p className="text-xs text-muted-foreground">Rua Oscar Freire, 204</p>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </div>
                  </div>

                  {/* Resumo e Preço - Removido formulário duplicado */}
                  {routeInfo && totalPrice > 0 && (
                    <div className="mt-6 bg-card p-4 rounded-2xl border border-border">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Distância</p>
                          <p className="text-lg font-bold">{routeInfo.distance} km</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Tempo</p>
                          <p className="text-lg font-bold">{routeInfo.duration} min</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold text-primary">
                            R$ {calculateFinalPrice(totalPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {routeError && (
                    <div className="mt-4 bg-card border border-[#8B2E2E] p-4 rounded-xl text-sm text-[#ffb4ab]">
                      {routeError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CORRIDA EM ANDAMENTO */}
            {screen === "ride-progress" && rideStatus !== "idle" && (
              <div className="space-y-4 max-w-2xl mx-auto lg:col-span-2">
                <RideStatusBadge status={rideStatus} />

                {/* Info do Motorista */}
                {(rideStatus === "accepted" || rideStatus === "ongoing") && (
                  <DriverCard driver={mockDriver} />
                )}

                {/* Rota */}
                <RouteDisplay
                  origin={origin}
                  destination={destination}
                  stops={stops}
                />

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

            {/* CHAT */}
            {screen === "chat" && (
              <div className="h-[calc(100vh-200px)] max-w-2xl mx-auto lg:col-span-2">
                <Chat driverName={mockDriver.name} driverPhoto={mockDriver.photo} />
              </div>
            )}

            {/* PAGAMENTO */}
            {screen === "payment" && (
              <div className="space-y-4 lg:col-span-2 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Formas de Pagamento</h2>
                <div className="bg-card border border-border p-6 rounded-2xl">
                  <PaymentMethods
                    selectedMethod={undefined}
                    onSelectMethod={(method) => {
                      console.log("Método selecionado:", method);
                      // Aqui você pode salvar o método selecionado
                    }}
                    totalAmount={totalPrice}
                    showFees={true}
                  />

                  <div className="mt-6 pt-6 border-t border-border">
                    <button className="w-full p-4 border border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-primary transition-all flex items-center justify-center gap-2">
                      <Plus size={20} />
                      <span>Adicionar nova forma de pagamento</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CADASTRO DE MOTORISTA */}
            {screen === "driver-registration" && (
              <DriverRegistration
                onSubmit={(data) => {
                  console.log("Dados do cadastro:", data);
                  // Aqui você enviaria os dados para a API
                  alert("Cadastro enviado com sucesso! Aguarde a análise.");
                  setScreen("home");
                }}
                onCancel={() => setScreen("home")}
              />
            )}
            {screen === "admin" && <AdminDashboard />}
              </>
            )}
          </div>
        </main>

        {/* Footer com Botão Pedir Agora e Navegação Inferior */}
        {screen === "home" && rideStatus === "idle" && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4 pb-8 z-50">
            <button
              onClick={handleRequestRide}
              disabled={!validatedOrigin || !validatedDestination || totalPrice === 0 || !!routeError}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pedir Agora
            </button>
            <BottomNavigation currentScreen={screen} onNavigate={setScreen} />
          </div>
        )}

        {/* Navegação Inferior para outras telas */}
        {screen !== "home" && screen !== "vaipet-preferences" && (
          <BottomNavigation currentScreen={screen} onNavigate={setScreen} />
        )}

        {/* Footer padrão */}
        {screen !== "home" && screen !== "vaipet-preferences" && (
          <footer className="bg-card border-t border-border py-4 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 VaiComigo - Mobilidade inteligente
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
