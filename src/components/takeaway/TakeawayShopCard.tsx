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
    <div className="flex gap-3 rounded-[1.25rem] border border-white/60 bg-white/80 p-3 backdrop-blur shadow-lg shadow-black/10 transition hover:border-white sm:gap-5 sm:rounded-[2rem] sm:p-4 md:p-5">
      <Link href={`/takeaway/${shop.slug}`} className="relative w-24 shrink-0 sm:w-32 md:w-44">
        <ShopMonogram shop={shop} priority={priority} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <Link href={`/takeaway/${shop.slug}`} className="font-display text-xl leading-tight hover:opacity-70 sm:text-2xl md:text-3xl" style={{ color: "var(--page-ink)" }}>{shop.name}</Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:mt-2 sm:text-sm" style={{ color: "var(--page-ink-soft)" }}>
              <span className="font-semibold" style={{ color: "var(--page-ink)" }}>★ {shop.rating.toFixed(1)}</span>
              <span>虚拟月售 {formatMonthlySales(shop.monthlySales)}</span>
              <span>{shop.distanceKm}km</span>
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            {shop.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs" style={{ color: "var(--page-ink-soft)" }}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs sm:mt-3 sm:flex-wrap sm:gap-x-4 sm:text-sm" style={{ color: "var(--page-ink-soft)" }}>
          <span>起送 ¥{shop.minOrder}</span>
          <span>配送 ¥{shop.deliveryFee}</span>
          <span>预计 {shop.deliveryTimeMin} 分钟</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 sm:mt-3">
          {shop.discounts.map((discount) => (
            <span key={discount} className="rounded-full border border-white/70 px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs" style={{ background: "var(--page-highlight)", color: "var(--page-ink)" }}>{discount}</span>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:gap-3">
          <Link href={`/takeaway/${shop.slug}`} className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/60 px-5 py-2.5 text-sm font-semibold transition hover:bg-white sm:px-6 sm:py-3" style={{ color: "var(--page-ink)" }}>进店</Link>
          <button onClick={quickOrder} className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:px-6 sm:py-3" style={{ background: "var(--page-accent)" }}>一键虚拟下单</button>
        </div>
      </div>
    </div>
  );
}
