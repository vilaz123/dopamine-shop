"use client";

import { useEffect, useMemo } from "react";
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
  const coins = useAssetStore((state) => state.coins);
  const xp = useAssetStore((state) => state.xp);
  const badges = useAssetStore((state) => state.badges);
  const coupons = useAssetStore((state) => state.coupons);
  const inventory = useAssetStore((state) => state.inventory);
  const favorites = useAssetStore((state) => state.favorites);
  const history = useAssetStore((state) => state.history);
  const assets = useMemo(
    () => ({ coins, xp, badges, coupons, inventory, favorites, history }),
    [coins, xp, badges, coupons, inventory, favorites, history],
  );

  useEffect(() => {
    if (!user) return;
    saveAccountSnapshot(user, { orders, assets, cart, shares });
  }, [user, orders, assets, cart, shares]);

  return null;
}
