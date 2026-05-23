import { create } from "zustand";
import { LocationStore } from "@/types";

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  stops: [],

  setUserLocation: ({ latitude, longitude, address }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));

    // Limpar motorista selecionado se necessário (importação dinâmica para evitar circular)
    setTimeout(() => {
      import("./driverStore").then(({ useDriverStore }) => {
        const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
        if (selectedDriver) clearSelectedDriver();
      });
    }, 0);
  },

  setDestinationLocation: ({ latitude, longitude, address }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));

    // Limpar motorista selecionado se necessário
    setTimeout(() => {
      import("./driverStore").then(({ useDriverStore }) => {
        const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
        if (selectedDriver) clearSelectedDriver();
      });
    }, 0);
  },

  addStop: (stop) => {
    set((state) => ({
      stops: [...state.stops, stop],
    }));
  },

  removeStop: (index) => {
    set((state) => ({
      stops: state.stops.filter((_, i) => i !== index),
    }));
  },

  clearStops: () => {
    set(() => ({ stops: [] }));
  },

  clearAll: () => {
    set(() => ({
      userLatitude: null,
      userLongitude: null,
      userAddress: null,
      destinationLatitude: null,
      destinationLongitude: null,
      destinationAddress: null,
      stops: [],
    }));
  },
}));
