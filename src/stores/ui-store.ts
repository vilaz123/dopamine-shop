"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/lib/utils/storage";

type Reward = { id: string; coins: number; xp?: number; badge?: string };

type UiState = {
  cartOpen: boolean;
  recentlyViewed: string[];
  lastReward: Reward | null;
  soundEnabled: boolean;
  setCartOpen: (open: boolean) => void;
  addRecentlyViewed: (slug: string) => void;
  setLastReward: (reward: Reward | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      cartOpen: false,
      recentlyViewed: [],
      lastReward: null,
      soundEnabled: true,
      setCartOpen: (cartOpen) => set({ cartOpen }),
      addRecentlyViewed: (slug) =>
        set((state) => ({
          recentlyViewed: [slug, ...state.recentlyViewed.filter((item) => item !== slug)].slice(0, 6),
        })),
      setLastReward: (lastReward) => set({ lastReward }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    }),
    {
      name: storageKeys.ui,
      partialize: (state) => ({
        cartOpen: false,
        recentlyViewed: state.recentlyViewed,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);
