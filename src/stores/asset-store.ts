"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { coupons } from "@/lib/data/coupons";
import type { AssetState, Badge } from "@/types/asset";
import { storageKeys } from "@/lib/utils/storage";

function levelFromXp(xp: number) {
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  return { level, xp, xpToNext: level * 100, title: level >= 5 ? "黄金仓主" : level >= 3 ? "高级仓主" : "新晋仓主" };
}

type AssetStore = AssetState & {
  grantCoins: (coins: number) => void;
  grantXp: (xp: number) => void;
  addCoupon: (code: string) => void;
  addInventory: (slug: string, quantity: number) => void;
  toggleFavorite: (slug: string) => void;
  pushHistory: (slug: string) => void;
  unlockBadges: (badges: Badge[]) => void;
  resetAssets: () => void;
};

const initialAssets: AssetState = {
  coins: 120,
  xp: 0,
  badges: [],
  coupons: coupons.slice(0, 3),
  inventory: {},
  favorites: [],
  history: [],
};

export const useAssetStore = create<AssetStore>()(
  persist(
    (set) => ({
      ...initialAssets,
      grantCoins: (coins) => set((state) => ({ coins: state.coins + coins })),
      grantXp: (xp) => set((state) => ({ xp: state.xp + xp })),
      addCoupon: (code) =>
        set((state) => {
          const coupon = coupons.find((item) => item.code === code);
          if (!coupon || state.coupons.some((item) => item.code === code)) return state;
          return { coupons: [coupon, ...state.coupons] };
        }),
      addInventory: (slug, quantity) =>
        set((state) => ({ inventory: { ...state.inventory, [slug]: (state.inventory[slug] ?? 0) + quantity } })),
      toggleFavorite: (slug) =>
        set((state) => ({
          favorites: state.favorites.includes(slug)
            ? state.favorites.filter((item) => item !== slug)
            : [slug, ...state.favorites].slice(0, 60),
        })),
      pushHistory: (slug) =>
        set((state) => ({ history: [slug, ...state.history.filter((item) => item !== slug)].slice(0, 40) })),
      unlockBadges: (badges) =>
        set((state) => {
          const owned = new Set(state.badges.map((badge) => badge.id));
          return { badges: [...badges.filter((badge) => !owned.has(badge.id)), ...state.badges] };
        }),
      resetAssets: () => set(initialAssets),
    }),
    { name: storageKeys.assets },
  ),
);

export function selectLevel(xp: number) {
  return levelFromXp(xp);
}
