"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { productImages } from "@/lib/data/products";
import { thumbUrl } from "@/lib/utils/image";
import { useInView } from "@/lib/utils/useInView";
import { useAutoCarousel } from "@/lib/utils/useAutoCarousel";
import { useTilt } from "@/lib/utils/useTilt";
import { useFill } from "@/lib/utils/useFill";
import { useCountUp } from "@/lib/utils/useCountUp";
import { Price } from "@/components/ui/Price";
import { ProductTagChips } from "./ProductTagChips";
import { FavoriteButton } from "./FavoriteButton";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 商品「轮转展示柜」卡：参照 BlindShowcase。竖向大卡 + 商品图自动轮播 +
 * 进视口错峰入场 + 桌面 3D 倾斜 + 霓虹描边 + 虚拟热度条 + 全宽渐变 CTA。
 * 配色延用当前分区 --page-*（由父级 .theme-* 提供），渐变用商品自身 accent/saturation。
 */
export function ProductShowcaseCard({ product, priority = false, enterDelay = 0 }: { product: Product; priority?: boolean; enterDelay?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [paused, setPaused] = useState(false);
  const { tiltRef, onMove, onLeave } = useTilt();
  const sold = useCountUp<HTMLParagraphElement>(product.sold);
  const fill = useFill(inView);

  const images = useMemo(() => productImages(product), [product]);
  const hasImages = images.length > 0;
  const { active } = useAutoCarousel(images.length, inView, paused);

  const lowStock = product.stock < 10;
  const heat = Math.min(1, product.sold / 10000);

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
        className="tilt-3d relative overflow-hidden rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6"
        style={{
          background: "color-mix(in srgb, var(--page-bg) 82%, white)",
          borderColor: "color-mix(in srgb, var(--page-accent) 55%, transparent)",
          color: "var(--page-ink)",
          boxShadow: `0 18px 50px color-mix(in srgb, ${product.accent} 28%, transparent)`,
        }}
        onMouseMove={onMove}
      >
        {/* 霓虹描边流转层 */}
        <span className="neon-edge pointer-events-none absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem]" aria-hidden />

        {/* 商品图轮播窗 */}
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl"
          style={{ background: `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${product.accent} 22%, white), color-mix(in srgb, var(--page-bg) 60%, white))` }}
        >
          {hasImages ? (
            <Link href={`/shop/${product.slug}`} className="absolute inset-0" aria-label={`查看 ${product.name} 详情`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={images[active]}
                src={`${BASE_PATH}${thumbUrl(images[active])}`}
                alt={product.name}
                className="carousel-item absolute inset-0 h-full w-full object-cover"
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
              />
              {/* 预取下一张，减少轮播切换空窗 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE_PATH}${thumbUrl(images[(active + 1) % images.length])}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-0"
                aria-hidden
                loading="lazy"
                decoding="async"
              />
            </Link>
          ) : (
            <Link
              href={`/shop/${product.slug}`}
              className="absolute inset-0 grid place-items-center"
              style={{ background: `linear-gradient(135deg, ${product.saturation}, ${product.accent})` }}
              aria-label={`查看 ${product.name} 详情`}
            >
              <span className="font-display text-5xl text-white/95 drop-shadow-2xl sm:text-6xl">{product.monogram}</span>
            </Link>
          )}

          {/* 角标 + 收藏（不嵌进 Link，独立叠层） */}
          <div className="absolute left-2 top-2 right-2 flex items-start justify-between gap-1.5 sm:left-2.5 sm:top-2.5 sm:right-2.5">
            <div className="min-w-0 max-w-[calc(100%-3rem)]">
              <ProductTagChips tags={product.tags} />
            </div>
            <FavoriteButton slug={product.slug} />
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
        <p className="mt-4 text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--hot)" }}>{product.badge}</p>
        <Link href={`/shop/${product.slug}`} className="font-display mt-1 block truncate text-lg leading-tight hover:opacity-70 sm:text-xl" style={{ color: "var(--page-ink)" }}>
          {product.name}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-xs sm:text-sm" style={{ color: "var(--page-soft)" }}>{product.subtitle}</p>

        {/* 虚拟热度条（真实 sold 归一化，进视口 0→目标） */}
        <div className="mt-3">
          <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--page-ink) 12%, transparent)" }}>
            <span
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${heat * fill * 100}%`, background: `linear-gradient(90deg, ${product.saturation}, ${product.accent})` }}
            />
          </div>
          <p className="mt-1.5 text-[11px]" style={{ color: "var(--page-soft)" }}>虚拟热度</p>
        </div>

        {/* 价格 + 低库存 */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <Price value={product.price} className="font-display text-xl sm:text-2xl" />
          {lowStock && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--danger)" }}>
              <span className="stock-pulse inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--danger)" }} />
              仅剩 {product.stock}
            </span>
          )}
        </div>
        <p ref={sold.ref} className="mt-1 text-[11px] sm:text-xs" style={{ color: "var(--page-soft)" }}>
          已有 {sold.value.toLocaleString("zh-CN")} 人虚拟下单
        </p>

        {/* 全宽渐变 CTA */}
        <Link
          href={`/shop/${product.slug}`}
          className="mt-4 block w-full rounded-full px-6 py-3 text-center text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-95"
          style={{ background: `linear-gradient(135deg, ${product.saturation}, ${product.accent})` }}
        >
          查看详情 →
        </Link>
      </div>
    </div>
  );
}
