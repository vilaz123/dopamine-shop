"use client";

import Link from "next/link";
import { products } from "@/lib/data/products";
import { cartItemHref } from "@/lib/data/takeaway-shops";
import { calculateDiscount } from "@/lib/data/coupons";
import { formatCurrency } from "@/lib/utils/format";
import { useCartStore } from "@/stores/cart-store";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { CouponPicker } from "@/components/checkout/CouponPicker";
import { BundleHints } from "@/components/checkout/BundleHints";
import { CartOptionEditor } from "@/components/cart/CartOptionEditor";
import { PageTheme } from "@/components/common/PageTheme";
import { useState } from "react";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setGiftWrap = useCartStore((state) => state.setGiftWrap);
  const [code, setCode] = useState("NEWCOMER");
  const lines = items
    .map((item) => ({ item, product: products.find((product) => product.slug === item.slug) }))
    .filter((line): line is { item: typeof items[number]; product: (typeof products)[number] } => Boolean(line.product));
  const subtotal = lines.reduce((sum, line) => sum + (line.product.price + (line.item.optionPriceDelta ?? 0)) * line.item.quantity + (line.item.giftWrap ? 9 : 0), 0);
  const { coupon, discount } = calculateDiscount(subtotal, code);
  const total = subtotal - discount;
  const rewardCoins = lines.reduce((sum, line) => sum + line.product.rewardCoins * line.item.quantity + (line.item.giftWrap ? 5 : 0), 0);
  const slugs = lines.map((line) => line.product.slug);
  const nextThreshold = [599, 999, 1999].find((threshold) => subtotal < threshold);

  return (
    <PageTheme className="min-h-screen">
    <section className="container-shell py-16">
      <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Cart</p>
      <h1 className="font-display mt-4 text-4xl sm:text-6xl" style={{ color: "var(--page-ink)" }}>虚拟购物车</h1>
      {lines.length === 0 ? (
        <div className="mt-12 rounded-[2.5rem] border border-dashed border-black/15 bg-white p-12 text-center">
          <p className="font-display text-4xl" style={{ color: "var(--page-ink)" }}>你的购物车是空的。</p>
          <p className="mt-4" style={{ color: "var(--page-soft)" }}>多巴胺仓还没开始装货。</p>
          <ButtonLink href="/shop" className="mt-8">开始虚拟购物</ButtonLink>
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_390px]">
          <div className="space-y-5">
            {lines.map(({ item, product }) => (
              <article key={`${item.slug}-${JSON.stringify(item.options)}-${item.giftWrap}`} className="rounded-[2rem] border border-black/10 bg-white p-6">
                <div className="flex flex-col justify-between gap-6 md:flex-row">
                  <div>
                    <Link href={cartItemHref(product.slug, product.deliveryFlavor)} className="font-display text-4xl">{product.name}</Link>
                    <p className="mt-2 text-[var(--muted)]">{product.subtitle}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
                    <CartOptionEditor item={item} product={product} />
                    {product.giftWrap && <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(item.giftWrap)} onChange={(e) => setGiftWrap(item.slug, item.options, e.target.checked)} /> 虚拟礼品包装 +¥9</label>}
                  </div>
                  <div className="text-left md:text-right">
                    <Price value={(product.price + (item.optionPriceDelta ?? 0)) * item.quantity + (item.giftWrap ? 9 : 0)} className="font-display text-3xl" />
                    <div className="mt-4 inline-flex items-center rounded-full border border-black/10">
                      <button className="px-4 py-2" onClick={() => setQuantity(item.slug, item.options, item.quantity - 1, item.giftWrap)}>-</button>
                      <span className="min-w-10 text-center">{item.quantity}</span>
                      <button className="px-4 py-2" onClick={() => setQuantity(item.slug, item.options, item.quantity + 1, item.giftWrap)}>+</button>
                    </div>
                    <button onClick={() => removeItem(item.slug, item.options, item.giftWrap)} className="mt-4 block text-xs uppercase tracking-[0.25em] text-[var(--muted)] md:ml-auto">移除</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-[2rem] bg-[var(--ink)] p-7 text-[var(--bone)]">
            <h2 className="font-display text-4xl">结算仪式</h2>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-white/70">
              {nextThreshold ? `再加 ${formatCurrency(nextThreshold - subtotal)} 解锁更大虚拟满减` : "已达到最高虚拟满减门槛"}
            </div>
            <div className="mt-5 bg-white text-black rounded-[1.5rem]"><CouponPicker subtotal={subtotal} value={code} onChange={setCode} /></div>
            <div className="mt-5 bg-white text-black rounded-[1.5rem]"><BundleHints slugs={slugs} /></div>
            <div className="mt-6 space-y-4 text-sm text-white/70">
              <div className="flex justify-between"><span>虚拟小计</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>{coupon?.label ?? "优惠"}</span><span>-{formatCurrency(discount)}</span></div>
              <div className="flex justify-between border-t border-white/10 pt-4 text-[var(--bone)]"><span>仍然不会支付</span><span className="font-display text-3xl">{formatCurrency(total)}</span></div>
            </div>
            <p className="mt-5 text-sm text-[var(--gold)]">结算预计获得 +{rewardCoins} 多巴胺币</p>
            <ButtonLink href={`/checkout?coupon=${code}`} variant="light" className="mt-8 w-full">进入虚拟结算</ButtonLink>
          </aside>
        </div>
      )}
    </section>
    </PageTheme>
  );
}
