"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { Button } from "@/components/ui/Button";

export function AddToCart({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const addRecentlyViewed = useUiStore((state) => state.addRecentlyViewed);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const pushHistory = useAssetStore((state) => state.pushHistory);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((option) => [option.label, option.values[0]])),
  );
  const optionText = useMemo(() => Object.values(selected).join(" / "), [selected]);

  useEffect(() => {
    addRecentlyViewed(product.slug);
    pushHistory(product.slug);
  }, [addRecentlyViewed, product.slug, pushHistory]);

  return (
    <div className="space-y-6">
      {product.options.map((option) => (
        <div key={option.label}>
          <p className="mb-3 text-sm font-semibold">{option.label}</p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => (
              <button
                key={value}
                onClick={() => setSelected((state) => ({ ...state, [option.label]: value }))}
                className={`rounded-full border px-4 py-2 text-sm transition ${selected[option.label] === value ? "border-black bg-black text-[#f6f1e8]" : "border-black/10 hover:border-black/30"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Button
        className="w-full"
        onClick={() => {
          addItem({ slug: product.slug, quantity: 1, options: selected });
          grantCoins(product.rewardCoins);
          setLastReward({ id: `${product.slug}-${Date.now()}`, coins: product.rewardCoins });
          setCartOpen(true);
        }}
      >
        加入虚拟购物车 · +{product.rewardCoins} 多巴胺币 · {optionText}
      </Button>
    </div>
  );
}
