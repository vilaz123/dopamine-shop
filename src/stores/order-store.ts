"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/types/order";
import { storageKeys } from "@/lib/utils/storage";

type OrderState = {
  orders: Order[];
  addOrder: (order: Order) => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders].slice(0, 100) })),
    }),
    { name: storageKeys.orders },
  ),
);
