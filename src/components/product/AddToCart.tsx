"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { optionValueDelta, optionValueLabel } from "@/types/product";
import { withBasePath } from "@/lib/utils/path";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

export function AddToCart({ product, sticky = false }: { product: Product; sticky?: boolean }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const addRecentlyViewed = useUiStore((state) => state.addRecentlyViewed);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const pushHistory = useAssetStore((state) => state.pushHistory);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((option) => [option.label, optionValueLabel(option.values[0])])),
  );
  const optionDelta = useMemo(
    () => product.options.reduce((sum, option) => sum + optionValueDelta(option.values.find((value) => optionValueLabel(value) === selected[option.label]) ?? option.values[0]), 0),
    [product.options, selected],
  );
  const finalPrice = product.price + optionDelta;
  const optionText = useMemo(() => Object.values(selected).join(" / "), [selected]);

  function add(openCart = true) {
    addRecentlyViewed(product.slug);
    pushHistory(product.slug);
    addItem({ slug: product.slug, quantity: 1, options: selected, optionPriceDelta: optionDelta, addedAt: new Date().toISOString() });
    grantCoins(product.rewardCoins);
    setLastReward({ id: `${product.slug}-${Date.now()}`, coins: product.rewardCoins });
    if (openCart) setCartOpen(true);
  }

  return (
    <div className="space-y-6">
      {product.options.map((option) => (
        <div key={option.label}>
          <p className="mb-3 text-sm font-semibold">{option.label}</p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((raw) => {
              const value = optionValueLabel(raw);
              const delta = optionValueDelta(raw);
              return (
                <button
                  key={value}
                  onClick={() => setSelected((state) => ({ ...state, [option.label]: value }))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${selected[option.label] === value ? "border-black bg-black text-[#f6f1e8]" : "border-black/10 hover:border-black/30"}`}
                >
                  {value}{delta ? ` +¥${delta}` : ""}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="rounded-2xl bg-[#fffaf2] p-4 text-sm text-[#7a7167]">
        已选：{optionText} · <Price value={finalPrice} className="font-display text-2xl text-black" />
      </div>
      <div className={`grid gap-3 ${sticky ? "grid-cols-2" : ""}`}>
        <Button className="w-full" onClick={() => add(true)}>加入购物车 · +{product.rewardCoins} 币</Button>
        <Button className="w-full" variant="ghost" onClick={() => { add(false); router.push(withBasePath("/checkout")); }}>一键虚拟下单</Button>
      </div>
    </div>
  );
}
