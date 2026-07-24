import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, interactive = false }: { products: Product[]; interactive?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        // 首屏前几张用 eager + fetchPriority high 抢 LCP;其余懒加载。
        // 入场错峰:按列位置(2/3 列)每列递增 60ms,同行动画错开。
        <ProductCard key={product.slug} product={product} priority={index < 3} enterDelay={(index % 3) * 60} interactive={interactive} />
      ))}
    </div>
  );
}
