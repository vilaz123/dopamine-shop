"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { productImages } from "@/lib/data/products";
import { thumbUrl } from "@/lib/utils/image";
import { Price } from "@/components/ui/Price";
import { ProductMonogram } from "./ProductMonogram";
import { ProductTagChips } from "./ProductTagChips";
import { FavoriteButton } from "./FavoriteButton";
import { useCountUp } from "@/lib/utils/useCountUp";
import { useInView } from "@/lib/utils/useInView";
import { useAutoCarousel } from "@/lib/utils/useAutoCarousel";
import { useTilt } from "@/lib/utils/useTilt";
import { useFill } from "@/lib/utils/useFill";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 商品卡。默认形态=原排版（首页/资产/相关商品沿用，零改动）。
 * 传入 interactive=true 时，在**不改变原有排版**的前提下叠加互动：
 * 图片自动轮播、进视口霓虹描边、桌面 3D 倾斜、虚拟热度条、全宽渐变 CTA。
 * 仅商店列表 / 外卖零食条启用，其余调用方保持原样。
 */
export function ProductCard({ product, priority = false, enterDelay = 0, interactive = false }: { product: Product; priority?: boolean; enterDelay?: number; interactive?: boolean }) {
  const sold = useCountUp<HTMLParagraphElement>(product.sold);
  const lowStock = product.stock < 10;

  // interactive 专用 hooks（非 interactive 分支不触发，保持原行为）
  const { ref: viewRef, inView } = useInView<HTMLAnchorElement>();
  const [paused, setPaused] = useState(false);
  const { tiltRef, onMove, onLeave } = useTilt();
  const fill = useFill(inView);
  const images = useMemo(() => (interactive ? productImages(product) : []), [product, interactive]);
  const { active } = useAutoCarousel(images.length, inView, paused);
  const hasImages = images.length > 0;
  const heat = Math.min(1, product.sold / 10000);

  const inner = (
    <>
      <div className="relative">
        {interactive && hasImages ? (
          // 图片轮播窗：沿用 ProductMonogram 的同款方框（aspect-[5/6] / 圆角 / 阴影 / 渐变 / 库存角标）
          <div className="relative aspect-[5/6] w-full overflow-hidden rounded-[1rem] sm:aspect-[4/5] sm:rounded-[1.25rem] md:rounded-[2rem] luxury-shadow">
            {/* 霓虹描边流转：挂在图片框上（进视口后 hover 高光沿边跑） */}
            <span className="neon-edge pointer-events-none absolute inset-0 rounded-[1rem] sm:rounded-[1.25rem] md:rounded-[2rem]" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={images[active]}
              src={`${BASE_PATH}${thumbUrl(images[active])}`}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10" />
            <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm sm:bottom-4 sm:left-4 sm:text-xs">库存 {product.stock}</div>
            {/* 轮播指示点 */}
            {images.length > 1 && (
              <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5">
                {images.slice(0, 8).map((src, i) => (
                  <span key={src} className="h-1.5 rounded-full transition-all" style={{ width: i === active ? 16 : 6, background: i === active ? "white" : "rgba(255,255,255,0.5)" }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <ProductMonogram product={product} priority={priority} />
        )}
        <div className="absolute left-2 top-2 right-2 flex items-start justify-between gap-1.5 sm:left-2.5 sm:top-2.5 sm:right-2.5 sm:gap-2">
          <div className="min-w-0 max-w-[calc(100%-2.5rem)]">
            <ProductTagChips tags={product.tags} />
          </div>
          <FavoriteButton slug={product.slug} />
        </div>
      </div>
      {/* 文字区:固定层级,名称限 2 行,价格与销量分两行底部对齐,保证多卡高度一致 */}
      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--hot)] sm:text-xs">{product.badge}</p>
        <h3 className="font-display mt-1 text-base leading-snug group-hover:text-[var(--hot)] sm:text-lg">{product.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--muted)] sm:text-sm">{product.subtitle}</p>
        {/* 虚拟热度条（真实 sold 归一化，进视口 0→目标） */}
        {interactive && (
          <div className="mt-3">
            <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--muted) 18%, transparent)" }}>
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${heat * fill * 100}%`, background: `linear-gradient(90deg, ${product.saturation}, ${product.accent})` }} />
            </div>
            <p className="mt-1 text-[11px] text-[var(--muted)]">虚拟热度</p>
          </div>
        )}
        <div className="mt-auto pt-2">
          <Price value={product.price} className="font-display text-lg sm:text-xl" />
          <p ref={sold.ref} className="mt-0.5 text-[11px] text-[var(--muted)] sm:text-xs">
            已有 {sold.value.toLocaleString("zh-CN")} 人下单
            {lowStock && (
              <span className="ml-2 inline-flex items-center gap-1 font-semibold" style={{ color: "var(--danger)" }}>
                <span className="stock-pulse inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--danger)" }} />
                仅剩 {product.stock}
              </span>
            )}
          </p>
        </div>
      </div>
      {/* 全宽渐变 CTA（整卡已是 Link，此处为样式条，点击随卡片跳转，避免嵌套交互） */}
      {interactive && (
        <span className="mt-3 block w-full rounded-full px-6 py-2.5 text-center text-sm font-semibold text-white transition group-hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${product.saturation}, ${product.accent})` }}>
          查看详情 →
        </span>
      )}
    </>
  );

  return (
    <Link
      ref={interactive ? viewRef : undefined}
      href={`/shop/${product.slug}`}
      className={`group flex h-full flex-col transition-transform duration-300 hover:-translate-y-1 sm:hover:-translate-y-1.5 ${interactive ? "showcase-card card-enter" : "card-enter"} ${interactive && inView ? "is-in" : ""}`}
      style={{ animationDelay: `${enterDelay}ms` }}
      onMouseEnter={interactive ? () => setPaused(true) : undefined}
      onMouseLeave={interactive ? () => { setPaused(false); onLeave(); } : undefined}
    >
      {interactive ? (
        <div ref={tiltRef} className="tilt-3d relative flex h-full flex-col" onMouseMove={onMove}>
          {inner}
        </div>
      ) : (
        inner
      )}
    </Link>
  );
}
