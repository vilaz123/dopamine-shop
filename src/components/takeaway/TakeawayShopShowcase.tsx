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

/** 店铺轮播图：主图 + 详情图，空值过滤。无图回退 ShopMonogram 单帧。 */
function shopImages(shop: TakeawayShop): string[] {
  return [shop.image, ...(shop.detailImages ?? [])].filter((v): v is string => Boolean(v));
}

/**
 * 外卖店「轮转展示柜」卡：参照 BlindShowcase。竖向大卡 + 店铺图自动轮播 +
 * 进视口错峰入场 + 桌面 3D 倾斜 + 霓虹描边 + 本月人气条 + 进店/一键下单。
 * 外卖区是 theme-food 深底，所以卡面用白卡 + --page-ink/--page-ink-soft 文字（不
 * 用浅色的 --page-soft，避免白卡上读不清）。
 */
export function TakeawayShopShowcase({ shop, priority = false }: { shop: TakeawayShop; priority?: boolean }) {
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

  const flagship = getProduct(shop.productSlugs[0]);
  const heat = Math.min(1, shop.monthlySales / 12000);

  function quickOrder() {
    if (!flagship) return;
    const selected = Object.fromEntries(flagship.options.map((o) => [o.label, optionValueLabel(o.values[0])]));
    const delta = flagship.options.reduce((sum, o) => sum + optionValueDelta(o.values[0]), 0);
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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        onLeave();
      }}
    >
      <div
        ref={tiltRef}
        className="tilt-3d relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/85 p-5 backdrop-blur sm:rounded-[2rem] sm:p-6"
        style={{ color: "var(--page-ink)", boxShadow: `0 18px 50px color-mix(in srgb, ${shop.accent} 28%, transparent)` }}
        onMouseMove={onMove}
      >
        {/* 霓虹描边流转层 */}
        <span className="neon-edge pointer-events-none absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem]" aria-hidden />

        {/* 店铺图轮播窗 */}
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl"
          style={{ background: `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${shop.accent} 22%, white), color-mix(in srgb, var(--page-bg) 60%, white))` }}
        >
          {hasImages ? (
            <Link href={`/takeaway/${shop.slug}`} className="absolute inset-0" aria-label={`进入 ${shop.name}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={images[active]}
                src={`${BASE_PATH}${thumbUrl(images[active])}`}
                alt={shop.name}
                className="carousel-item absolute inset-0 h-full w-full object-cover"
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
            </Link>
          ) : (
            <Link href={`/takeaway/${shop.slug}`} className="absolute inset-0" aria-label={`进入 ${shop.name}`}>
              <ShopMonogram shop={shop} priority={priority} />
            </Link>
          )}

          {/* 分类角标 */}
          <div className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm sm:bottom-4 sm:left-4 sm:text-xs">
            {shop.category}
          </div>
          {/* 评分角标 */}
          <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:right-4 sm:top-4">
            ★ {shop.rating.toFixed(1)}
          </div>

          {/* 轮播指示点 */}
          {images.length > 1 && (
            <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5">
              {images.slice(0, 8).map((src, i) => (
                <span
                  key={src}
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: i === active ? 16 : 6, background: i === active ? "white" : "rgba(255,255,255,0.5)" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 文字区 */}
        <Link href={`/takeaway/${shop.slug}`} className="font-display mt-4 block truncate text-lg leading-tight hover:opacity-70 sm:text-xl" style={{ color: "var(--page-ink)" }}>
          {shop.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs" style={{ color: "var(--page-ink-soft)" }}>
          <span className="font-semibold" style={{ color: "var(--page-ink)" }}>★ {shop.rating.toFixed(1)}</span>
          <span>月售 {formatMonthlySales(shop.monthlySales)}</span>
          <span>{shop.distanceKm}km</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: "var(--page-ink-soft)" }}>
          <span>起送 ¥{shop.minOrder}</span>
          <span>配送 ¥{shop.deliveryFee}</span>
          <span>约 {shop.deliveryTimeMin} 分钟</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {shop.discounts.map((d) => (
            <span key={d} className="rounded-full border border-white/70 px-2 py-0.5 text-[11px]" style={{ background: "var(--page-highlight)", color: "var(--page-ink)" }}>
              {d}
            </span>
          ))}
        </div>

        {/* 本月人气条（真实 monthlySales 归一化，进视口 0→目标） */}
        <div className="mt-3">
          <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--page-ink) 12%, transparent)" }}>
            <span
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${heat * fill * 100}%`, background: `linear-gradient(90deg, ${shop.saturation}, ${shop.accent})` }}
            />
          </div>
          <p className="mt-1.5 text-[11px]" style={{ color: "var(--page-ink-soft)" }}>本月人气</p>
        </div>

        {/* CTA：进店 + 一键下单 */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/takeaway/${shop.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--page-accent)_55%,transparent)] bg-white/60 px-3 py-3 text-sm font-semibold transition hover:bg-white"
            style={{ color: "var(--page-ink)" }}
          >
            进店
          </Link>
          <button
            onClick={quickOrder}
            className="inline-flex flex-1 items-center justify-center rounded-full px-3 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${shop.saturation}, ${shop.accent})` }}
          >
            一键下单
          </button>
        </div>
      </div>
    </div>
  );
}
