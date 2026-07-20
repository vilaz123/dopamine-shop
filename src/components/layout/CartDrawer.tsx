"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { products } from "@/lib/data/products";
import { cartItemHref } from "@/lib/data/takeaway-shops";
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
  const total = lines.reduce((sum, line) => sum + line.product.price * line.item.quantity + (line.item.giftWrap ? 9 : 0), 0);
  const rewardCoins = lines.reduce((sum, line) => sum + line.product.rewardCoins * line.item.quantity + (line.item.giftWrap ? 5 : 0), 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/35" onClick={() => setOpen(false)} aria-label="关闭购物车遮罩" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white p-4 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between border-b border-black/10 pb-4 sm:pb-5">
          <h2 className="font-display text-2xl sm:text-3xl">多巴胺购物车</h2>
          <button onClick={() => setOpen(false)} className="rounded-full border border-black/10 p-2"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto py-6">
          {lines.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/15 p-8 text-center text-[var(--muted)]">购物车是空的，钱包也是安全的。</div>
          ) : (
            <div className="space-y-5">
              {lines.map(({ item, product }) => (
                <div key={`${item.slug}-${JSON.stringify(item.options)}-${item.giftWrap}`} className="border-b border-black/10 pb-5">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={cartItemHref(product.slug, product.deliveryFlavor)} onClick={() => setOpen(false)} className="font-display line-clamp-2 text-xl sm:text-2xl">{product.name}</Link>
                      <p className="mt-1 text-sm text-[var(--muted)]">数量 {item.quantity} · {Object.values(item.options).join(" / ")}{item.giftWrap ? " · 礼品包装" : ""}</p>
                    </div>
                    <p className="shrink-0 font-display text-lg sm:text-xl">{formatCurrency(product.price * item.quantity + (item.giftWrap ? 9 : 0))}</p>
                  </div>
                  <button onClick={() => removeItem(item.slug, item.options, item.giftWrap)} className="mt-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)] hover:text-black">移除</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-black/10 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-[var(--muted)]">虚拟金额</span>
            <span className="font-display text-3xl">{formatCurrency(total)}</span>
          </div>
          <p className="mb-5 text-sm text-[var(--hot)]">结算预计获得 +{rewardCoins} 多巴胺币，实际扣款 ¥0。</p>
          <ButtonLink href="/cart" className="w-full" onClick={() => setOpen(false)}>查看购物车</ButtonLink>
        </div>
      </aside>
    </div>
  );
}
