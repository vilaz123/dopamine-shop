import Link from "next/link";
import type { Product } from "@/types/product";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { ProductMonogram } from "./ProductMonogram";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <ProductMonogram product={product} />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <Badge>{product.badge}</Badge>
          <h3 className="font-display mt-4 text-3xl leading-none group-hover:text-[#8b6b2f]">{product.name}</h3>
          <p className="mt-2 text-sm text-[#7a7167]">{product.subtitle}</p>
        </div>
        <Price value={product.price} className="font-display text-2xl" />
      </div>
    </Link>
  );
}
