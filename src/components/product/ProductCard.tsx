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
        <div className="absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
          <ProductTagChips tags={product.tags} />
          <FavoriteButton slug={product.slug} />
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b6b2f]">{product.badge}</p>
          <h3 className="font-display mt-3 text-3xl leading-none group-hover:text-[#8b6b2f]">{product.name}</h3>
          <p className="mt-2 text-sm text-[#7a7167]">{product.subtitle}</p>
          <p className="mt-2 text-xs text-[#9a3b2f]">已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单 · 无需真实支付</p>
        </div>
        <Price value={product.price} className="font-display text-2xl" />
      </div>
    </Link>
  );
}
