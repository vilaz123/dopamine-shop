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

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
      <section className="relative overflow-hidden bg-[#241A4D] text-[#FFF5F8]">
        <img
          src={`${BASE_PATH}/banners/hero.webp`}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/75" />
        <div className="container-shell relative grid min-h-[78vh] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.38em] text-[#ffd23f]">Dopahub 多巴胺仓</p>
            <h1 className="font-display max-w-4xl text-6xl leading-[.88] md:text-8xl">虚拟下单，真实不付款。</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/80">复刻浏览、加购、满减、物流与晒单的快感，把扣款痛苦完全抹除。库存有限，物流永远在路上。</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/shop" variant="light">进入多巴胺仓</ButtonLink>
              <ButtonLink href="/assets" variant="ghost" className="border-white/20 text-[#FFF5F8] hover:border-white/60">查看虚拟资产</ButtonLink>
              <ShareButton className="border border-white/20 bg-transparent text-[#FFF5F8] hover:border-white/60" type="invite" title="Dopahub 多巴胺仓" text="我发现了一个可以虚拟下单、真实不付款的网站，来试试看。" />
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[.06] p-8 backdrop-blur">
            <p className="text-sm text-white/55">刚被虚拟下单</p>
            <div className="mt-8 space-y-6">
              {hot.map((product, index) => (
                <Link href={`/shop/${product.slug}`} key={product.slug} className="flex items-center justify-between border-b border-white/10 pb-5 last:border-0">
                  <div>
                    <p className="text-xs text-[#ffd23f]">TOP {index + 1} · 已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单</p>
                    <h3 className="font-display mt-1 text-3xl">{product.name}</h3>
                    <p className="text-sm text-white/50">虚拟库存仅剩 {product.stock} 件</p>
                  </div>
                  <Price value={product.price} className="font-display text-2xl text-[#ffd23f]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-20">
        <div className="relative overflow-hidden rounded-[2.5rem]">
          <img src={`${BASE_PATH}/banners/recommend.webp`} alt="" aria-hidden className="h-56 w-full object-cover md:h-72" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.32em] text-[#ffd23f]">For You</p>
            <h2 className="font-display mt-3 text-5xl text-white">为你推荐</h2>
          </div>
        </div>
        <div className="mt-10"><ProductGrid products={recommended} /></div>
      </section>

      <section className="container-shell py-20">
        <div className="relative overflow-hidden rounded-[2.5rem]">
          <img src={`${BASE_PATH}/banners/food.webp`} alt="" aria-hidden className="h-56 w-full object-cover md:h-72" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#ef4444]">Food Delivery</p>
              <h2 className="font-display mt-3 text-5xl text-white">虚拟外卖专区</h2>
            </div>
            <div className="flex justify-end">
              <ButtonLink href="/takeaway" variant="light">去点外卖</ButtonLink>
            </div>
          </div>
        </div>
        <div className="mt-10"><ProductGrid products={food} /></div>
      </section>
    </>
  );
}
