"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { products } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils/format";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { ButtonLink } from "@/components/ui/Button";

export function CartDrawer() {
  const open = useUiStore((state) => state.cartOpen);
  const setOpen = useUiStore((state) => state.setCartOpen);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const lines = items
    .map((item) => ({ item, product: products.find((product) => product.slug === item.slug) }))
    .filter((line): line is { item: typeof items[number]; product: (typeof products)[number] } => Boolean(line.product));
  const total = lines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/35" onClick={() => setOpen(false)} aria-label="关闭购物车遮罩" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fffaf2] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 pb-5">
          <h2 className="font-display text-3xl">虚拟购物车</h2>
          <button onClick={() => setOpen(false)} className="rounded-full border border-black/10 p-2"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto py-6">
          {lines.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/15 p-8 text-center text-[#7a7167]">购物车是空的，钱包也是安全的。</div>
          ) : (
            <div className="space-y-5">
              {lines.map(({ item, product }) => (
                <div key={`${item.slug}-${JSON.stringify(item.options)}`} className="border-b border-black/10 pb-5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/shop/${product.slug}`} onClick={() => setOpen(false)} className="font-display text-2xl">{product.name}</Link>
                      <p className="mt-1 text-sm text-[#7a7167]">数量 {item.quantity} · {Object.values(item.options).join(" / ")}</p>
                    </div>
                    <p className="font-display text-xl">{formatCurrency(product.price * item.quantity)}</p>
                  </div>
                  <button onClick={() => removeItem(item.slug, item.options)} className="mt-3 text-xs uppercase tracking-[0.25em] text-[#7a7167] hover:text-black">移除</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-black/10 pt-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm text-[#7a7167]">本次避免真实支出</span>
            <span className="font-display text-3xl">{formatCurrency(total)}</span>
          </div>
          <ButtonLink href="/cart" className="w-full" onClick={() => setOpen(false)}>查看购物车</ButtonLink>
        </div>
      </aside>
    </div>
  );
}
