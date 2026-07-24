"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { Price } from "@/components/ui/Price";
import { ProductMonogram } from "./ProductMonogram";
import { ProductTagChips } from "./ProductTagChips";
import { FavoriteButton } from "./FavoriteButton";
import { useCountUp } from "@/lib/utils/useCountUp";

export function ProductCard({ product, priority = false, enterDelay = 0 }: { product: Product; priority?: boolean; enterDelay?: number }) {
  const sold = useCountUp<HTMLParagraphElement>(product.sold);
  const lowStock = product.stock < 10;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="card-enter group flex h-full flex-col transition-transform duration-300 hover:-translate-y-1 sm:hover:-translate-y-1.5"
      style={{ animationDelay: `${enterDelay}ms` }}
    >
      <div className="relative">
        <ProductMonogram product={product} priority={priority} />
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
    </Link>
  );
}
