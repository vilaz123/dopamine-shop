import Link from "next/link";
import type { Product } from "@/types/product";
import { Price } from "@/components/ui/Price";
import { ProductMonogram } from "./ProductMonogram";
import { ProductTagChips } from "./ProductTagChips";
import { FavoriteButton } from "./FavoriteButton";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative">
        <ProductMonogram product={product} priority={priority} />
        <div className="absolute left-3 top-3 right-3 flex items-start justify-between gap-2">
          <ProductTagChips tags={product.tags} />
          <FavoriteButton slug={product.slug} />
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--hot)]">{product.badge}</p>
          <h3 className="font-display mt-2 text-2xl leading-tight group-hover:text-[var(--hot)] sm:text-3xl">{product.name}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{product.subtitle}</p>
          <p className="mt-1 text-xs text-[var(--hot)]">已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单 · 无需真实支付</p>
        </div>
        <Price value={product.price} className="font-display text-xl shrink-0 sm:text-2xl" />
      </div>
    </Link>
  );
}
