"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/lib/data/products";
import { promoCodes } from "@/lib/data/promo-codes";
import { formatCurrency } from "@/lib/utils/format";
import { makeOrderId } from "@/lib/utils/id";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export default function CheckoutPage() {
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const promo = promoCodes[promoCode];
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const addOrder = useOrderStore((state) => state.addOrder);
  const [name, setName] = useState("理智签收人");
  const [address, setAddress] = useState("一条不存在但很美的街道 27 号");
  const [paymentMethod, setPaymentMethod] = useState("Dopamine Pay · 余额无限");
  const [impulseBefore, setImpulseBefore] = useState(8);
  const [moodAfter, setMoodAfter] = useState("已经冷静");
  const [note, setNote] = useState("");

  useEffect(() => {
    setPromoCode(new URLSearchParams(window.location.search).get("promo")?.toUpperCase() ?? "");
  }, []);

  const lines = useMemo(
    () =>
      items
        .map((item) => ({ item, product: products.find((product) => product.slug === item.slug) }))
        .filter((line): line is { item: typeof items[number]; product: (typeof products)[number] } => Boolean(line.product)),
    [items],
  );
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0);
  const discount = promo ? Math.round(subtotal * promo.discountRate) : 0;
  const total = subtotal - discount;

  function submit() {
    if (lines.length === 0) return;
    const order = {
      id: makeOrderId(),
      createdAt: new Date().toISOString(),
      items: lines.map(({ item, product }) => ({
        ...item,
        name: product.name,
        subtitle: product.subtitle,
        price: product.price,
        accent: product.accent,
        monogram: product.monogram,
      })),
      subtotal,
      discount,
      total,
      profile: { name, address, paymentMethod, impulseBefore, moodAfter, note },
    };
    addOrder(order);
    clear();
    router.push(`/orders?order=${order.id}`);
  }

  if (lines.length === 0) {
    return (
      <section className="container-shell py-16">
        <div className="rounded-[2.5rem] border border-dashed border-black/15 bg-[#fffaf2] p-12 text-center">
          <h1 className="font-display text-5xl">没有可结算的虚拟商品。</h1>
          <ButtonLink href="/shop" className="mt-8">返回商店</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell py-16">
      <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">Checkout</p>
      <h1 className="font-display mt-4 text-6xl">虚拟结算</h1>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-[#fffaf2] p-7">
            <h2 className="font-display text-4xl">1. 虚拟收货信息</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="签收人" />
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="虚拟地址" />
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#fffaf2] p-7">
            <h2 className="font-display text-4xl">2. 不会扣款的支付方式</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {["Dopamine Pay · 余额无限", "幻想余额 · 永不扣款", "今日冲动额度"].map((method) => (
                <button key={method} onClick={() => setPaymentMethod(method)} className={`rounded-2xl border p-4 text-left text-sm ${paymentMethod === method ? "border-black bg-black text-[#f6f1e8]" : "border-black/10"}`}>{method}</button>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#fffaf2] p-7">
            <h2 className="font-display text-4xl">3. 记录一下这次冲动</h2>
            <label className="mt-6 block text-sm text-[#7a7167]">下单前冲动指数：{impulseBefore}/10</label>
            <input type="range" min="1" max="10" value={impulseBefore} onChange={(e) => setImpulseBefore(Number(e.target.value))} className="mt-3 w-full" />
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {["更想买了", "好一点了", "已经冷静", "觉得不需要了"].map((mood) => (
                <button key={mood} onClick={() => setMoodAfter(mood)} className={`rounded-full border px-4 py-3 text-sm ${moodAfter === mood ? "border-black bg-black text-[#f6f1e8]" : "border-black/10"}`}>{mood}</button>
              ))}
            </div>
            <Textarea className="mt-5" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="可选：写下你为什么想买它。" />
          </div>
        </div>
        <aside className="h-fit rounded-[2rem] bg-[#0b0b0b] p-7 text-[#f6f1e8]">
          <h2 className="font-display text-4xl">确认虚拟订单</h2>
          <div className="mt-6 space-y-4">
            {lines.map(({ item, product }) => (
              <div key={`${item.slug}-${JSON.stringify(item.options)}`} className="flex justify-between gap-4 border-b border-white/10 pb-4 text-sm text-white/70">
                <span>{product.name} × {item.quantity}</span>
                <span>{formatCurrency(product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 text-sm text-white/70">
            <div className="flex justify-between"><span>虚拟小计</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>优惠</span><span>-{formatCurrency(discount)}</span></div>
            <div className="flex justify-between border-t border-white/10 pt-4 text-[#f6f1e8]"><span>实际扣款</span><span className="font-display text-4xl">¥0</span></div>
            <p className="text-[#b5975a]">你刚刚避免了 {formatCurrency(total)} 的真实支出。</p>
          </div>
          <Button type="button" variant="light" className="mt-8 w-full" onClick={submit}>生成虚拟订单</Button>
        </aside>
      </div>
    </section>
  );
}
