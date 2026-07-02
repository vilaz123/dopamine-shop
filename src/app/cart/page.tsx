"use client";

import Link from "next/link";
import { products } from "@/lib/data/products";
import { promoCodes } from "@/lib/data/promo-codes";
import { formatCurrency } from "@/lib/utils/format";
import { useCartStore } from "@/stores/cart-store";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const [code, setCode] = useState("");
  const normalized = code.trim().toUpperCase();
  const promo = promoCodes[normalized];
  const lines = items
    .map((item) => ({ item, product: products.find((product) => product.slug === item.slug) }))
    .filter((line): line is { item: typeof items[number]; product: (typeof products)[number] } => Boolean(line.product));
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0);
  const discount = promo ? Math.round(subtotal * promo.discountRate) : 0;
  const total = subtotal - discount;

  return (
    <section className="container-shell py-16">
      <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">Cart</p>
      <h1 className="font-display mt-4 text-6xl">虚拟购物车</h1>
      {lines.length === 0 ? (
        <div className="mt-12 rounded-[2.5rem] border border-dashed border-black/15 bg-[#fffaf2] p-12 text-center">
          <p className="font-display text-4xl">你的购物车是空的。</p>
          <p className="mt-4 text-[#7a7167]">这很好，但你也可以安全地逛一逛。</p>
          <ButtonLink href="/shop" className="mt-8">开始虚拟购物</ButtonLink>
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {lines.map(({ item, product }) => (
              <article key={`${item.slug}-${JSON.stringify(item.options)}`} className="rounded-[2rem] border border-black/10 bg-[#fffaf2] p-6">
                <div className="flex flex-col justify-between gap-6 md:flex-row">
                  <div>
                    <Link href={`/shop/${product.slug}`} className="font-display text-4xl">{product.name}</Link>
                    <p className="mt-2 text-[#7a7167]">{product.subtitle}</p>
                    <p className="mt-2 text-sm text-[#7a7167]">{Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-display text-3xl">{formatCurrency(product.price * item.quantity)}</p>
                    <div className="mt-4 inline-flex items-center rounded-full border border-black/10">
                      <button className="px-4 py-2" onClick={() => setQuantity(item.slug, item.options, item.quantity - 1)}>-</button>
                      <span className="min-w-10 text-center">{item.quantity}</span>
                      <button className="px-4 py-2" onClick={() => setQuantity(item.slug, item.options, item.quantity + 1)}>+</button>
                    </div>
                    <button onClick={() => removeItem(item.slug, item.options)} className="mt-4 block text-xs uppercase tracking-[0.25em] text-[#7a7167] md:ml-auto">移除</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-[2rem] bg-[#0b0b0b] p-7 text-[#f6f1e8]">
            <h2 className="font-display text-4xl">订单摘要</h2>
            <div className="mt-6 space-y-4 text-sm text-white/70">
              <div className="flex justify-between"><span>虚拟小计</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>冷静优惠</span><span>-{formatCurrency(discount)}</span></div>
              <div className="flex justify-between border-t border-white/10 pt-4 text-[#f6f1e8]"><span>仍然不会支付</span><span className="font-display text-3xl">{formatCurrency(total)}</span></div>
            </div>
            <div className="mt-6">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="试试 CALMDOWN / NOSPEND" className="bg-white text-black" />
              {promo && <p className="mt-2 text-sm text-[#b5975a]">已应用：{promo.label}</p>}
            </div>
            <ButtonLink href={`/checkout?promo=${normalized}`} variant="light" className="mt-8 w-full">进入虚拟结算</ButtonLink>
            <Button type="button" variant="ghost" className="mt-3 w-full border-white/20 text-[#f6f1e8]" onClick={() => setCode("NOSPEND")}>使用不花钱纪念券</Button>
          </aside>
        </div>
      )}
    </section>
  );
}
