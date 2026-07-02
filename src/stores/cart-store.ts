"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import { storageKeys } from "@/lib/utils/storage";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (slug: string, options: Record<string, string>) => void;
  setQuantity: (slug: string, options: Record<string, string>, quantity: number) => void;
  clear: () => void;
};

function sameOptions(a: Record<string, string>, b: Record<string, string>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => a[key] === b[key]);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((entry) => entry.slug === item.slug && sameOptions(entry.options, item.options));
          if (!existing) return { items: [item, ...state.items] };
          return {
            items: state.items.map((entry) =>
              entry === existing ? { ...entry, quantity: entry.quantity + item.quantity } : entry,
            ),
          };
        }),
      removeItem: (slug, options) =>
        set((state) => ({
          items: state.items.filter((item) => !(item.slug === slug && sameOptions(item.options, options))),
        })),
      setQuantity: (slug, options, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.slug === slug && sameOptions(item.options, options) ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: storageKeys.cart },
  ),
);
