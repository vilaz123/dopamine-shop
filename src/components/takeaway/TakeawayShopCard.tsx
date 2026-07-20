"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TakeawayShop } from "@/lib/data/takeaway-shops";
import { formatMonthlySales } from "@/lib/data/takeaway-shops";
import { getProduct } from "@/lib/data/products";
import { optionValueLabel, optionValueDelta } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { ShopMonogram } from "./ShopMonogram";

export function TakeawayShopCard({ shop, priority = false }: { shop: TakeawayShop; priority?: boolean }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const addRecentlyViewed = useUiStore((state) => state.addRecentlyViewed);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const pushHistory = useAssetStore((state) => state.pushHistory);

  const flagship = getProduct(shop.productSlugs[0]);

  function quickOrder() {
    if (!flagship) return;
    const selected = Object.fromEntries(flagship.options.map((option) => [option.label, optionValueLabel(option.values[0])]));
    const delta = flagship.options.reduce((sum, option) => sum + optionValueDelta(option.values[0]), 0);
    addRecentlyViewed(flagship.slug);
    pushHistory(flagship.slug);
    addItem({ slug: flagship.slug, quantity: 1, options: selected, optionPriceDelta: delta, addedAt: new Date().toISOString() });
    grantCoins(flagship.rewardCoins);
    setLastReward({ id: `${flagship.slug}-${Date.now()}`, coins: flagship.rewardCoins });
    setCartOpen(false);
    router.push("/checkout");
  }

  return (
    <div className="flex gap-3 rounded-[1.25rem] border border-white/60 bg-white/80 p-3 backdrop-blur shadow-lg shadow-black/10 transition hover:border-white sm:gap-4 sm:rounded-[2rem] sm:p-4">
      <Link href={`/takeaway/${shop.slug}`} className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl sm:w-32 sm:rounded-2xl">
        <ShopMonogram shop={shop} priority={priority} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/takeaway/${shop.slug}`} className="font-display text-lg leading-tight hover:opacity-70 sm:text-xl" style={{ color: "var(--page-ink)" }}>{shop.name}</Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs" style={{ color: "var(--page-ink-soft)" }}>
              <span className="font-semibold" style={{ color: "var(--page-ink)" }}>★ {shop.rating.toFixed(1)}</span>
              <span>月售 {formatMonthlySales(shop.monthlySales)}</span>
              <span>{shop.distanceKm}km</span>
            </div>
          </div>
          <div className="hidden shrink-0 gap-1.5 md:flex">
            {shop.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full border border-white/70 bg-white/60 px-2.5 py-0.5 text-[11px]" style={{ color: "var(--page-ink-soft)" }}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: "var(--page-ink-soft)" }}>
          <span>起送 ¥{shop.minOrder}</span>
          <span>配送 ¥{shop.deliveryFee}</span>
          <span>约 {shop.deliveryTimeMin} 分钟</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {shop.discounts.map((discount) => (
            <span key={discount} className="rounded-full border border-white/70 px-2 py-0.5 text-[11px]" style={{ background: "var(--page-highlight)", color: "var(--page-ink)" }}>{discount}</span>
          ))}
        </div>
        {/* 按钮推到底部，与方形图底部对齐，构图稳 */}
        <div className="mt-auto flex gap-2 pt-2.5">
          <Link href={`/takeaway/${shop.slug}`} className="inline-flex flex-1 items-center justify-center rounded-full border border-white/70 bg-white/60 px-3 py-2 text-xs font-semibold transition hover:bg-white sm:px-4 sm:text-sm" style={{ color: "var(--page-ink)" }}>进店</Link>
          <button onClick={quickOrder} className="inline-flex flex-1 items-center justify-center rounded-full px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:px-4 sm:text-sm" style={{ background: "var(--page-accent)" }}>一键下单</button>
        </div>
      </div>
    </div>
  );
}
