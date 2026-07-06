"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import { storageKeys } from "@/lib/utils/storage";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (slug: string, options: Record<string, string>, giftWrap?: boolean) => void;
  setQuantity: (slug: string, options: Record<string, string>, quantity: number, giftWrap?: boolean) => void;
  setGiftWrap: (slug: string, options: Record<string, string>, giftWrap: boolean) => void;
  updateOptions: (slug: string, options: Record<string, string>, nextOptions: Record<string, string>, optionPriceDelta: number, giftWrap?: boolean) => void;
  clear: () => void;
};

function sameOptions(a: Record<string, string>, b: Record<string, string>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => a[key] === b[key]);
}

function sameLine(a: CartItem, slug: string, options: Record<string, string>, giftWrap?: boolean) {
  return a.slug === slug && sameOptions(a.options, options) && Boolean(a.giftWrap) === Boolean(giftWrap);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((entry) => sameLine(entry, item.slug, item.options, item.giftWrap));
          if (!existing) return { items: [item, ...state.items] };
          return {
            items: state.items.map((entry) =>
              entry === existing ? { ...entry, quantity: entry.quantity + item.quantity } : entry,
            ),
          };
        }),
      removeItem: (slug, options, giftWrap) =>
        set((state) => ({
          items: state.items.filter((item) => !sameLine(item, slug, options, giftWrap)),
        })),
      setQuantity: (slug, options, quantity, giftWrap) =>
        set((state) => ({
          items: state.items
            .map((item) => (sameLine(item, slug, options, giftWrap) ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        })),
      setGiftWrap: (slug, options, giftWrap) =>
        set((state) => ({
          items: state.items.map((item) => (item.slug === slug && sameOptions(item.options, options) ? { ...item, giftWrap } : item)),
        })),
      updateOptions: (slug, options, nextOptions, optionPriceDelta, giftWrap) =>
        set((state) => ({
          items: state.items.map((item) =>
            sameLine(item, slug, options, giftWrap)
              ? { ...item, options: nextOptions, optionPriceDelta }
              : item,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: storageKeys.cart },
  ),
);
