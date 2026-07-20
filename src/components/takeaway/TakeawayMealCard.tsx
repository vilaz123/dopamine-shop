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
    <div className="rounded-[1.25rem] border border-white/60 bg-white/85 p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <Link
          href={`/shop/${product.slug}`}
          className="flex aspect-[4/3] w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:w-24 sm:rounded-2xl"
          style={product.image ? undefined : { background: `linear-gradient(135deg, ${product.saturation}, var(--page-ink) 78%)` }}
          aria-label={`查看 ${product.name} 详情`}
        >
          {product.image ? (
            <img src={`${BASE_PATH}${thumbUrl(product.image)}`} alt={product.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <span className="font-display text-2xl text-white/95 sm:text-3xl">{product.monogram}</span>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/shop/${product.slug}`} className="font-display text-xl leading-tight hover:opacity-70 sm:text-2xl" style={{ color: "var(--page-ink)" }}>{product.name}</Link>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--page-ink-soft)" }}>{product.subtitle}</p>
          <p className="mt-1 text-[11px] sm:text-xs" style={{ color: "var(--page-accent)" }}>已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Price value={product.price} className="font-display text-xl sm:text-2xl" />
            <div className="flex flex-wrap justify-end gap-2">
              <Link href={`/shop/${product.slug}`} className="rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-xs transition hover:bg-white sm:px-4 sm:py-2 sm:text-sm" style={{ color: "var(--page-ink)" }}>详情</Link>
              <button onClick={() => setExpanded((value) => !value)} className="rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-xs transition hover:bg-white sm:px-4 sm:py-2 sm:text-sm" style={{ color: "var(--page-ink)" }}>{expanded ? "收起" : "选规格"}</button>
              {!expanded && (
                <button onClick={quickAdd} className="rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 sm:px-5 sm:py-2 sm:text-sm" style={{ background: "var(--page-accent)" }}>加购</button>
              )}
            </div>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 border-t border-black/10 pt-4 sm:mt-5 sm:pt-5">
          <AddToCart product={product} />
        </div>
      )}
    </div>
  );
}
