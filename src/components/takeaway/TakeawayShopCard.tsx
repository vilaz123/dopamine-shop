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

export function TakeawayShopCard({ shop }: { shop: TakeawayShop }) {
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
    <div className="flex gap-5 rounded-[2rem] border border-black/10 bg-[#fffaf2] p-4 transition hover:border-black/30 md:p-5">
      <Link href={`/takeaway/${shop.slug}`} className="relative w-32 shrink-0 sm:w-44">
        <ShopMonogram shop={shop} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/takeaway/${shop.slug}`} className="font-display text-3xl leading-none hover:text-[#8b6b2f] md:text-4xl">{shop.name}</Link>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#554c43]">
              <span className="font-semibold text-black">★ {shop.rating.toFixed(1)}</span>
              <span>虚拟月售 {formatMonthlySales(shop.monthlySales)}</span>
              <span>{shop.distanceKm}km 幻想距离</span>
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            {shop.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full border border-black/10 px-3 py-1 text-xs text-[#7a7167]">{tag}</span>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#7a7167]">
          <span>起送 ¥{shop.minOrder}</span>
          <span>配送 ¥{shop.deliveryFee}</span>
          <span>预计 {shop.deliveryTimeMin} 分钟后进入骑手配送中</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {shop.discounts.map((discount) => (
            <span key={discount} className="rounded-full border border-yellow-400/50 bg-yellow-400/15 px-3 py-1 text-xs text-[#8b6b2f]">{discount}</span>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <Link href={`/takeaway/${shop.slug}`} className="inline-flex items-center justify-center rounded-full border border-black/15 bg-transparent px-6 py-3 text-sm font-semibold transition hover:border-black/40">进店</Link>
          <button onClick={quickOrder} className="inline-flex items-center justify-center rounded-full bg-[#0b0b0b] px-6 py-3 text-sm font-semibold text-[#f6f1e8] transition hover:bg-[#2a2118]">一键虚拟下单</button>
        </div>
      </div>
    </div>
  );
}
