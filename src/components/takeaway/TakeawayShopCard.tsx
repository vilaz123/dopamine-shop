"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TakeawayShop } from "@/lib/data/takeaway-shops";
import { formatMonthlySales } from "@/lib/data/takeaway-shops";
import { getProduct } from "@/lib/data/products";
import { optionValueLabel, optionValueDelta } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { thumbUrl } from "@/lib/utils/image";
import { useInView } from "@/lib/utils/useInView";
import { useAutoCarousel } from "@/lib/utils/useAutoCarousel";
import { useTilt } from "@/lib/utils/useTilt";
import { useFill } from "@/lib/utils/useFill";
import { ShopMonogram } from "./ShopMonogram";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 店铺轮播图：主图 + 详情图，空值过滤。 */
function shopImages(shop: TakeawayShop): string[] {
  return [shop.image, ...(shop.detailImages ?? [])].filter((v): v is string => Boolean(v));
}

/**
 * 外卖店卡（原横向排版不变）。叠加互动：店铺图自动轮播、进视口霓虹描边、
 * 桌面 3D 倾斜、本月人气条。进店/一键下单沿用原结构（一键下单升级为渐变 CTA）。
 */
export function TakeawayShopCard({ shop, priority = false, enterDelay = 0 }: { shop: TakeawayShop; priority?: boolean; enterDelay?: number }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const addRecentlyViewed = useUiStore((state) => state.addRecentlyViewed);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const pushHistory = useAssetStore((state) => state.pushHistory);

  const { ref, inView } = useInView<HTMLDivElement>();
  const [paused, setPaused] = useState(false);
  const { tiltRef, onMove, onLeave } = useTilt();
  const fill = useFill(inView);

  const images = useMemo(() => shopImages(shop), [shop]);
  const hasImages = images.length > 0;
  const { active } = useAutoCarousel(images.length, inView, paused);
  const heat = Math.min(1, shop.monthlySales / 12000);

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
    <div
      ref={ref}
      className={`showcase-card card-enter relative ${inView ? "is-in" : ""}`}
      style={{ animationDelay: `${enterDelay}ms` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        onLeave();
      }}
    >
      <div
        ref={tiltRef}
        className="tilt-3d flex w-full gap-3 rounded-[1.25rem] border border-white/60 bg-white/80 p-3 backdrop-blur shadow-lg shadow-black/10 transition hover:border-white sm:gap-4 sm:rounded-[2rem] sm:p-4"
        onMouseMove={onMove}
      >
        {/* 店铺图轮播窗：沿用原方框尺寸 w-24 sm:w-32 aspect-square，无图回退 ShopMonogram */}
        <Link href={`/takeaway/${shop.slug}`} className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl sm:w-32 sm:rounded-2xl">
          {hasImages ? (
            <>
              {/* 霓虹描边流转：挂在图片框上 */}
              <span className="neon-edge pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={images[active]}
                src={`${BASE_PATH}${thumbUrl(images[active])}`}
                alt={shop.name}
                className="absolute inset-0 h-full w-full object-cover"
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
              />
              {/* 预取下一张 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE_PATH}${thumbUrl(images[(active + 1) % images.length])}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-0"
                aria-hidden
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10" />
              {/* 轮播指示点 */}
              {images.length > 1 && (
                <div className="absolute left-1/2 top-2 flex -translate-x-1/2 gap-1">
                  {images.slice(0, 8).map((src, i) => (
                    <span key={src} className="h-1 rounded-full transition-all" style={{ width: i === active ? 12 : 5, background: i === active ? "white" : "rgba(255,255,255,0.5)" }} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <ShopMonogram shop={shop} priority={priority} />
          )}
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
          {/* 本月人气条（真实 monthlySales 归一化，进视口 0→目标） */}
          <div className="mt-2">
            <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--page-ink) 12%, transparent)" }}>
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${heat * fill * 100}%`, background: `linear-gradient(90deg, ${shop.saturation}, ${shop.accent})` }} />
            </div>
            <p className="mt-1 text-[11px]" style={{ color: "var(--page-ink-soft)" }}>本月人气</p>
          </div>
          {/* 按钮推到底部，与方形图底部对齐，构图稳 */}
          <div className="mt-auto flex gap-2 pt-2.5">
            <Link href={`/takeaway/${shop.slug}`} className="inline-flex flex-1 items-center justify-center rounded-full border border-white/70 bg-white/60 px-3 py-2 text-xs font-semibold transition hover:bg-white sm:px-4 sm:text-sm" style={{ color: "var(--page-ink)" }}>进店</Link>
            <button onClick={quickOrder} className="inline-flex flex-1 items-center justify-center rounded-full px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95 sm:px-4 sm:text-sm" style={{ background: `linear-gradient(135deg, ${shop.saturation}, ${shop.accent})` }}>一键下单</button>
          </div>
        </div>
      </div>
    </div>
  );
}
