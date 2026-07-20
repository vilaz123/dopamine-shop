"use client";

import Link from "next/link";
import { useMemo } from "react";
import { products } from "@/lib/data/products";
import { recommendForUser } from "@/lib/recommend/recommend";
import { useAssetStore } from "@/stores/asset-store";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { ShareButton } from "@/components/share/ShareButton";

export function HomeFeed() {
  const history = useAssetStore((state) => state.history);
  const cartItems = useCartStore((state) => state.items);
  const orders = useOrderStore((state) => state.orders);
  const cartSlugs = useMemo(() => cartItems.map((item) => item.slug), [cartItems]);
  const orderSlugs = useMemo(() => orders.flatMap((order) => order.items.map((item) => item.slug)), [orders]);
  const recommended = useMemo(
    () => recommendForUser({ products, history, cartSlugs, orderSlugs, limit: 6 }),
    [history, cartSlugs, orderSlugs],
  );
  const hot = useMemo(() => [...products].sort((a, b) => b.sold - a.sold).slice(0, 5), []);
  const food = useMemo(() => products.filter((product) => product.category === "food-delivery"), []);

  return (
    <>
      <section className="theme-home relative overflow-hidden">
        <div className="page-paint absolute inset-0 -z-10" aria-hidden />
        <div className="container-shell relative grid min-h-[70vh] items-center gap-10 py-16 sm:min-h-[78vh] sm:gap-12 sm:py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.38em] sm:mb-6" style={{ color: "var(--page-ink)" }}>Dopahub 多巴胺仓</p>
            <h1 className="font-display max-w-4xl text-5xl leading-[.95] sm:text-6xl md:text-8xl md:leading-[.88]" style={{ color: "var(--page-ink)" }}>虚拟下单，真实不付款。</h1>
            <p className="mt-6 max-w-xl text-base leading-7 sm:mt-8 sm:text-lg sm:leading-8" style={{ color: "var(--page-soft)" }}>复刻浏览、加购、满减、物流与晒单的快感，把扣款痛苦完全抹除。库存有限，物流永远在路上。</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/shop" variant="light">进入多巴胺仓</ButtonLink>
              <ButtonLink href="/assets" variant="ghost">查看虚拟资产</ButtonLink>
              <ShareButton className="border border-current bg-transparent hover:opacity-70" type="invite" title="Dopahub 多巴胺仓" text="我发现了一个可以虚拟下单、真实不付款的网站，来试试看。" />
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/40 bg-white/70 p-8 backdrop-blur">
            <p className="text-sm" style={{ color: "var(--page-soft)" }}>刚被虚拟下单</p>
            <div className="mt-8 space-y-6">
              {hot.map((product, index) => (
                <Link href={`/shop/${product.slug}`} key={product.slug} className="flex items-center justify-between border-b border-black/10 pb-5 last:border-0">
                  <div>
                    <p className="text-xs" style={{ color: "var(--page-highlight)", filter: "saturate(1.1)" }}>TOP {index + 1} · 已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单</p>
                    <h3 className="font-display mt-1 text-3xl" style={{ color: "var(--page-ink)" }}>{product.name}</h3>
                    <p className="text-sm" style={{ color: "var(--page-soft)" }}>虚拟库存仅剩 {product.stock} 件</p>
                  </div>
                  <span style={{ color: "var(--page-ink)" }}><Price value={product.price} className="font-display text-2xl" /></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="theme-home relative overflow-hidden py-14 sm:py-20">
        <div className="page-paint absolute inset-0 -z-10" aria-hidden />
        <div className="container-shell">
          <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>For You</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl" style={{ color: "var(--page-ink)" }}>为你推荐</h2>
          <div className="mt-8 sm:mt-10"><ProductGrid products={recommended} /></div>
        </div>
      </section>

      <section className="theme-home relative overflow-hidden py-14 sm:py-20">
        <div className="page-paint absolute inset-0 -z-10" aria-hidden />
        <div className="container-shell">
          <div className="mb-8 flex items-end justify-between sm:mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Food Delivery</p>
              <h2 className="font-display mt-3 text-4xl sm:text-5xl" style={{ color: "var(--page-ink)" }}>虚拟外卖专区</h2>
            </div>
            <ButtonLink href="/takeaway" variant="light">去点外卖</ButtonLink>
          </div>
          <ProductGrid products={food} />
        </div>
      </section>
    </>
  );
}
