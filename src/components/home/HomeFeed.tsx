"use client";

import { products } from "@/lib/data/products";
import { recommendForUser } from "@/lib/recommend/recommend";
import { useAssetStore } from "@/stores/asset-store";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

export function HomeFeed() {
  const history = useAssetStore((state) => state.history);
  const cartSlugs = useCartStore((state) => state.items.map((item) => item.slug));
  const orderSlugs = useOrderStore((state) => state.orders.flatMap((order) => order.items.map((item) => item.slug)));
  const recommended = recommendForUser({ products, history, cartSlugs, orderSlugs, limit: 6 });
  const hot = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const food = products.filter((product) => product.category === "food-delivery");

  return (
    <>
      <section className="bg-[#0b0b0b] text-[#f6f1e8]">
        <div className="container-shell grid min-h-[78vh] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.38em] text-[#ffd23f]">Dopahub 多巴胺仓</p>
            <h1 className="font-display max-w-4xl text-6xl leading-[.88] md:text-8xl">虚拟下单，真实不付款。</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/70">复刻浏览、加购、满减、物流与晒单的快感，把扣款痛苦完全抹除。库存有限，物流永远在路上。</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/shop" variant="light">进入多巴胺仓</ButtonLink>
              <ButtonLink href="/assets" variant="ghost" className="border-white/20 text-[#f6f1e8] hover:border-white/60">查看虚拟资产</ButtonLink>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[.06] p-8 backdrop-blur">
            <p className="text-sm text-white/55">刚被虚拟下单</p>
            <div className="mt-8 space-y-6">
              {hot.map((product, index) => (
                <a href={`/shop/${product.slug}`} key={product.slug} className="flex items-center justify-between border-b border-white/10 pb-5 last:border-0">
                  <div>
                    <p className="text-xs text-[#ffd23f]">TOP {index + 1} · 已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单</p>
                    <h3 className="font-display mt-1 text-3xl">{product.name}</h3>
                    <p className="text-sm text-white/50">虚拟库存仅剩 {product.stock} 件</p>
                  </div>
                  <Price value={product.price} className="font-display text-2xl text-[#ffd23f]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-20">
        <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">For You</p>
        <h2 className="font-display mt-3 text-5xl">为你推荐</h2>
        <div className="mt-10"><ProductGrid products={recommended} /></div>
      </section>

      <section className="container-shell rounded-[2.5rem] bg-[#fffaf2] p-10 md:p-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#ef4444]">Food Delivery</p>
            <h2 className="font-display mt-3 text-5xl">虚拟外卖专区</h2>
          </div>
          <ButtonLink href="/shop?category=food-delivery" variant="ghost">去点外卖</ButtonLink>
        </div>
        <ProductGrid products={food} />
      </section>
    </>
  );
}
