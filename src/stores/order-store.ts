"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/types/order";
import { storageKeys } from "@/lib/utils/storage";
import { getSupabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

type PendingDelivery = {
  orderId: string;
  deliverAt: string; // ISO，createdAt + 60s
  items: { slug: string; name: string; category?: string; quantity: number }[];
};

type OrderState = {
  orders: Order[];
  /** 待收货：到 deliverAt 时间弹收货确认。 */
  pendingDeliveries: PendingDelivery[];
  addOrder: (order: Order) => void;
  signOrder: (id: string) => void;
  addPendingDelivery: (d: PendingDelivery) => void;
  confirmDelivery: (orderId: string) => void;
};

/** 把订单同步到云端 orders 表（用于社区每日自律排行榜聚合）。
 *  失败静默：本地订单仍生效，只是不进排行。匿名用户也写（匿名 uid 同样可聚合）。 */
function syncOrderToCloud(order: Order) {
  const supabase = getSupabase();
  const user = useAuthStore.getState().user;
  if (!supabase || !user) return;
  void supabase
    .from("orders")
    .upsert(
      { id: order.id, user_id: user.id, created_at: order.createdAt, payload: order },
      { onConflict: "id" },
    )
    .then(() => undefined);
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      pendingDeliveries: [],
      addOrder: (order) => {
        set((state) => ({ orders: [order, ...state.orders].slice(0, 100) }));
        syncOrderToCloud(order);
      },
      signOrder: (id) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, profile: { ...order.profile, signedAt: new Date().toISOString() } } : order,
          ),
        })),
      addPendingDelivery: (d) =>
        set((state) =>
          state.pendingDeliveries.some((p) => p.orderId === d.orderId)
            ? state
            : { pendingDeliveries: [...state.pendingDeliveries, d] },
        ),
      confirmDelivery: (orderId) =>
        set((state) => ({
          pendingDeliveries: state.pendingDeliveries.filter((p) => p.orderId !== orderId),
        })),
    }),
    { name: storageKeys.orders },
  ),
);
