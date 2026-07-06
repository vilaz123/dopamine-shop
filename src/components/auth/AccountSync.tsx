"use client";

import { useEffect } from "react";
import { saveAccountSnapshot } from "@/lib/account/account-storage";
import { useAssetStore } from "@/stores/asset-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { useShareStore } from "@/stores/share-store";

export function AccountSync() {
  const user = useAuthStore((state) => state.user);
  const orders = useOrderStore((state) => state.orders);
  const cart = useCartStore((state) => state.items);
  const shares = useShareStore((state) => state.shares);
  const assets = useAssetStore((state) => ({
    coins: state.coins,
    xp: state.xp,
    badges: state.badges,
    coupons: state.coupons,
    inventory: state.inventory,
    favorites: state.favorites,
    history: state.history,
  }));

  useEffect(() => {
    if (!user) return;
    saveAccountSnapshot(user, { orders, assets, cart, shares });
  }, [user, orders, assets, cart, shares]);

  return null;
}
