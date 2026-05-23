import { create } from "zustand";
import { CategoryStore, CategorySelection, RegionType } from "@/types";

const initialCategories: CategorySelection = {
  passengers: 1,
  hasPet: false,
  isDelivery: false,
  isMarket: false,
  hasTrunk: false,
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: initialCategories,
  region: "vale-jequitinhonha",

  setCategories: (categories) => set(() => ({ categories })),

  setRegion: (region) => set(() => ({ region })),

  resetCategories: () => set(() => ({ categories: initialCategories })),
}));
