"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/lib/utils/storage";

type UiState = {
  cartOpen: boolean;
  recentlyViewed: string[];
  setCartOpen: (open: boolean) => void;
  addRecentlyViewed: (slug: string) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      cartOpen: false,
      recentlyViewed: [],
      setCartOpen: (cartOpen) => set({ cartOpen }),
      addRecentlyViewed: (slug) =>
        set((state) => ({
          recentlyViewed: [slug, ...state.recentlyViewed.filter((item) => item !== slug)].slice(0, 6),
        })),
    }),
    { name: storageKeys.ui },
  ),
);
