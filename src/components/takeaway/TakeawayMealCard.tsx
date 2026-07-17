"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { optionValueLabel, optionValueDelta } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { Price } from "@/components/ui/Price";
import { AddToCart } from "@/components/product/AddToCart";
import { thumbUrl } from "@/lib/utils/image";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function TakeawayMealCard({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const addRecentlyViewed = useUiStore((state) => state.addRecentlyViewed);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const pushHistory = useAssetStore((state) => state.pushHistory);

  function quickAdd() {
    const selected = Object.fromEntries(product.options.map((option) => [option.label, optionValueLabel(option.values[0])]));
    const delta = product.options.reduce((sum, option) => sum + optionValueDelta(option.values[0]), 0);
    addRecentlyViewed(product.slug);
    pushHistory(product.slug);
    addItem({ slug: product.slug, quantity: 1, options: selected, optionPriceDelta: delta, addedAt: new Date().toISOString() });
    grantCoins(product.rewardCoins);
    setLastReward({ id: `${product.slug}-${Date.now()}`, coins: product.rewardCoins });
    setCartOpen(true);
  }

  return (
    <div className="rounded-[1.5rem] border border-white/60 bg-white/85 p-5 shadow-sm">
      <div className="flex gap-4">
        <Link
          href={`/shop/${product.slug}`}
          className="flex aspect-[4/3] w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
          style={product.image ? undefined : { background: `linear-gradient(135deg, ${product.saturation}, var(--page-ink) 78%)` }}
          aria-label={`查看 ${product.name} 详情`}
        >
          {product.image ? (
            <img src={`${BASE_PATH}${thumbUrl(product.image)}`} alt={product.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <span className="font-display text-3xl text-white/95">{product.monogram}</span>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/shop/${product.slug}`} className="font-display text-2xl leading-none hover:opacity-70" style={{ color: "var(--page-ink)" }}>{product.name}</Link>
          <p className="mt-1 text-sm" style={{ color: "var(--page-ink-soft)" }}>{product.subtitle}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--page-accent)" }}>已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <Price value={product.price} className="font-display text-2xl" />
            <div className="flex flex-wrap gap-2">
              <Link href={`/shop/${product.slug}`} className="rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm transition hover:bg-white" style={{ color: "var(--page-ink)" }}>查看详情</Link>
              <button onClick={() => setExpanded((value) => !value)} className="rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm transition hover:bg-white" style={{ color: "var(--page-ink)" }}>{expanded ? "收起规格" : "选规格"}</button>
              {!expanded && (
                <button onClick={quickAdd} className="rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "var(--page-accent)" }}>加入购物车</button>
              )}
            </div>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="mt-5 border-t border-black/10 pt-5">
          <AddToCart product={product} />
        </div>
      )}
    </div>
  );
}
