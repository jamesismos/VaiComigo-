// Tipos centralizados para o VaiComigo
// Baseado na estrutura do Uber Clone

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface MarkerData {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  rating: number;
  totalRides: number;
  car: string;
  plate: string;
  photo: string;
  phone: string;
  price: number;
  time: number;
  car_seats: number;
}

export interface Driver {
  id: number;
  name: string;
  rating: number;
  totalRides: number;
  car: string;
  plate: string;
  photo: string;
  phone: string;
  price: number;
  time: number;
  car_seats: number;
  latitude?: number;
  longitude?: number;
}

export interface Ride {
  id: number;
  driver: string;
  from: string;
  to: string;
  price: number;
  rating: number;
  date: string;
  category: "passenger" | "pet" | "delivery" | "market";
  passengers: number;
  hasPet: boolean;
  stops?: string[];
}

export interface RouteInfo {
  distance: string;
  duration: number;
}

export interface CategorySelection {
  passengers: number;
  hasPet: boolean;
  isDelivery: boolean;
  isMarket: boolean;
  hasTrunk: boolean;
}

export type RideStatus =
  | "idle"
  | "searching"
  | "accepted"
  | "ongoing"
  | "completed";

export type CategoryType = "passenger" | "pet" | "delivery" | "market";
export type RegionType = "vale-jequitinhonha" | "belo-horizonte" | "interior";

export interface Coupon {
  code: string;
  discount: number;
  type: "percent" | "fixed";
  description: string;
  minValue: number;
  categoryType?: CategoryType;
}

// Store Types
export interface LocationStore {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  stops: Array<{
    latitude: number;
    longitude: number;
    address: string;
  }>;
  setUserLocation: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  addStop: (stop: { latitude: number; longitude: number; address: string }) => void;
  removeStop: (index: number) => void;
  clearStops: () => void;
  clearAll: () => void;
}

export interface DriverStore {
  drivers: MarkerData[];
  selectedDriver: number | null;
  setSelectedDriver: (driverId: number | null) => void;
  setDrivers: (drivers: MarkerData[]) => void;
  clearSelectedDriver: () => void;
}

export interface RideStore {
  currentRide: {
    origin: string;
    destination: string;
    stops: string[];
    routeInfo: RouteInfo | null;
    totalPrice: number;
    appliedCoupon: Coupon | null;
    categories: CategorySelection;
    region: RegionType;
    status: RideStatus;
    driver: Driver | null;
  } | null;
  setCurrentRide: (ride: RideStore["currentRide"]) => void;
  updateRideStatus: (status: RideStatus) => void;
  setRideDriver: (driver: Driver | null) => void;
  clearCurrentRide: () => void;
}

export interface CategoryStore {
  categories: CategorySelection;
  region: RegionType;
  setCategories: (categories: CategorySelection) => void;
  setRegion: (region: RegionType) => void;
  resetCategories: () => void;
}

// Tipos para Cadastro de Motorista
export interface DriverRegistration {
  // Dados Pessoais
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  
  // Endereço
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Documentos
  cnhNumber: string;
  cnhCategory: string; // A, B, C, D, E
  cnhExpiryDate: string;
  cnhPhoto?: string; // URL da foto da CNH
  
  // Veículo
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  vehiclePlate: string;
  vehicleSeats: number;
  vehiclePhoto?: string; // URL da foto do veículo
  
  // Documentos do Veículo
  crlvPhoto?: string; // Certificado de Registro e Licenciamento de Veículo
  insurancePhoto?: string; // Seguro do veículo
  
  // Assinatura Mensal
  subscriptionPlan: "basic" | "premium" | "enterprise";
  subscriptionStatus: "pending" | "active" | "expired" | "cancelled";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  
  // Status do Cadastro
  registrationStatus: "draft" | "pending_review" | "approved" | "rejected";
  rejectionReason?: string;
  
  // Dados Bancários (para recebimento)
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  accountType?: "checking" | "savings";
  pixKey?: string;
}

// Tipos para Assinatura Mensal
export interface SubscriptionPlan {
  id: "basic" | "premium" | "enterprise";
  name: string;
  description: string;
  monthlyPrice: number;
  features: string[];
  maxRidesPerMonth?: number;
  commissionRate: number; // % de comissão do app
  supportLevel: "basic" | "priority" | "dedicated";
}

export interface Subscription {
  id: string;
  driverId: string;
  planId: "basic" | "premium" | "enterprise";
  status: "pending" | "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  paymentMethod: "credit_card" | "pix" | "bank_transfer";
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}
