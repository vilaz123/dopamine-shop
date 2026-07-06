"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/types/order";
import { storageKeys } from "@/lib/utils/storage";

type OrderState = {
  orders: Order[];
  addOrder: (order: Order) => void;
  signOrder: (id: string) => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders].slice(0, 100) })),
      signOrder: (id) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, profile: { ...order.profile, signedAt: new Date().toISOString() } } : order,
          ),
        })),
    }),
    { name: storageKeys.orders },
  ),
);
