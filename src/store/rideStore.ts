import { create } from "zustand";
import { RideStore, CategorySelection, RegionType, RideStatus, Driver, Coupon, RouteInfo } from "@/types";

const initialCategories: CategorySelection = {
  passengers: 1,
  hasPet: false,
  isDelivery: false,
  isMarket: false,
  hasTrunk: false,
};

export const useRideStore = create<RideStore>((set) => ({
  currentRide: null,

  setCurrentRide: (ride) => set(() => ({ currentRide: ride })),

  updateRideStatus: (status) =>
    set((state) => ({
      currentRide: state.currentRide
        ? { ...state.currentRide, status }
        : null,
    })),

  setRideDriver: (driver) =>
    set((state) => ({
      currentRide: state.currentRide
        ? { ...state.currentRide, driver }
        : null,
    })),

  clearCurrentRide: () =>
    set(() => ({
      currentRide: {
        origin: "",
        destination: "",
        stops: [],
        routeInfo: null,
        totalPrice: 0,
        appliedCoupon: null,
        categories: initialCategories,
        region: "vale-jequitinhonha",
        status: "idle",
        driver: null,
      },
    })),
}));
