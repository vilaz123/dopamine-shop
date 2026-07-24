"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { optionValueDelta, optionValueLabel } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { playPop, playChip } from "@/lib/utils/sfx";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

export function AddToCart({ product, sticky = false }: { product: Product; sticky?: boolean }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const triggerFly = useUiStore((state) => state.triggerFly);
  const addRecentlyViewed = useUiStore((state) => state.addRecentlyViewed);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const pushHistory = useAssetStore((state) => state.pushHistory);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((option) => [option.label, optionValueLabel(option.values[0])])),
  );
  const [justAdded, setJustAdded] = useState(false);
  const optionDelta = useMemo(
    () => product.options.reduce((sum, option) => sum + optionValueDelta(option.values.find((value) => optionValueLabel(value) === selected[option.label]) ?? option.values[0]), 0),
    [product.options, selected],
  );
  const finalPrice = product.price + optionDelta;
  const optionText = useMemo(() => Object.values(selected).join(" / "), [selected]);

  function add(openCart: boolean, btn?: HTMLButtonElement) {
    addRecentlyViewed(product.slug);
    pushHistory(product.slug);
    addItem({ slug: product.slug, quantity: 1, options: selected, optionPriceDelta: optionDelta, addedAt: new Date().toISOString() });
    grantCoins(product.rewardCoins);
    setLastReward({ id: `${product.slug}-${Date.now()}`, coins: product.rewardCoins });
    playPop();
    // 飞金币:从按钮中心飞向购物车图标。
    if (btn) {
      const r = btn.getBoundingClientRect();
      triggerFly({ fromX: r.left + r.width / 2, fromY: r.top + r.height / 2, coins: product.rewardCoins, color: "var(--gold)" });
    }
    // 文案瞬时确认。
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 900);
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
              const isSel = selected[option.label] === value;
              return (
                <button
                  key={value}
                  onClick={() => {
                    setSelected((state) => ({ ...state, [option.label]: value }));
                    if (!isSel) playChip();
                  }}
                  className={`rounded-full border px-4 py-2 text-sm transition ${isSel ? "border-black bg-black text-[var(--bone)] chip-pop" : "border-black/10 hover:border-black/30"}`}
                >
                  {value}{delta ? ` +¥${delta}` : ""}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="rounded-2xl bg-white p-4 text-sm text-[var(--muted)]">
        已选：{optionText} · <Price value={finalPrice} className="font-display text-2xl text-black" />
      </div>
      <div className={`grid gap-3 ${sticky ? "grid-cols-2" : ""}`}>
        <Button
          className="w-full active:scale-95 transition"
          onClick={(e) => add(true, e.currentTarget)}
        >
          {justAdded ? "✓ 已加入购物车" : `加入购物车 · +${product.rewardCoins} 币`}
        </Button>
        <Button
          className="w-full active:scale-95 transition"
          variant="ghost"
          onClick={(e) => { add(false, e.currentTarget); router.push("/checkout"); }}
        >
          一键虚拟下单
        </Button>
      </div>
    </div>
  );
}
