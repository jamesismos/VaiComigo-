import { create } from "zustand";
import { DriverStore, MarkerData } from "@/types";

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  
  setSelectedDriver: (driverId) =>
    set(() => ({ selectedDriver: driverId })),
  
  setDrivers: (drivers) => set(() => ({ drivers })),
  
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
}));
