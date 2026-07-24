"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/lib/utils/storage";

type Reward = { id: string; coins: number; xp?: number; badge?: string };

/** 飞金币触发载荷:从 (fromX,fromY) 飞向购物车图标,coins 枚,颜色 color。 */
type FlyToCart = { id: string; fromX: number; fromY: number; coins: number; color: string };

type UiState = {
  cartOpen: boolean;
  recentlyViewed: string[];
  lastReward: Reward | null;
  soundEnabled: boolean;
  flyToCart: FlyToCart | null;
  setCartOpen: (open: boolean) => void;
  addRecentlyViewed: (slug: string) => void;
  setLastReward: (reward: Reward | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  triggerFly: (payload: Omit<FlyToCart, "id">) => void;
  clearFly: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      cartOpen: false,
      recentlyViewed: [],
      lastReward: null,
      soundEnabled: true,
      flyToCart: null,
      setCartOpen: (cartOpen) => set({ cartOpen }),
      addRecentlyViewed: (slug) =>
        set((state) => ({
          recentlyViewed: [slug, ...state.recentlyViewed.filter((item) => item !== slug)].slice(0, 6),
        })),
      setLastReward: (lastReward) => set({ lastReward }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      // 飞金币不持久化(瞬态),用 id 让监听组件每次都感知新触发。
      triggerFly: (payload) => set({ flyToCart: { ...payload, id: `fly-${Date.now()}-${Math.floor(Math.random() * 1e6)}` } }),
      clearFly: () => set({ flyToCart: null }),
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
