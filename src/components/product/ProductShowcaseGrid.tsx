import type { Product } from "@/types/product";
import { ProductShowcaseCard } from "./ProductShowcaseCard";

/**
 * 商品展示柜网格：手机 1 列、sm 2 列、lg 3 列（对齐盲盒 BlindShowcase 的栅格）。
 * 首屏前 3 张 eager 抢 LCP，其余懒加载；入场按列位置错峰 60ms。
 */
export function ProductShowcaseGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductShowcaseCard key={product.slug} product={product} priority={index < 3} enterDelay={(index % 3) * 60} />
      ))}
    </div>
  );
}
