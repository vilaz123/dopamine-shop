import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        // 首屏前几张用 eager + fetchPriority high 抢 LCP；其余懒加载
        <ProductCard key={product.slug} product={product} priority={index < 3} />
      ))}
    </div>
  );
}
