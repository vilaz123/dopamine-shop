"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { products } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils/format";

export function TakeawayCartBar() {
  const items = useCartStore((state) => state.items);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    if (!product) return sum;
    return sum + (product.price + (item.optionPriceDelta ?? 0)) * item.quantity;
  }, 0);
  if (count === 0) return null;
  return (
    <div className="sticky bottom-4 z-30 mt-10">
      <div className="container-shell">
        <Link href="/checkout" className="luxury-shadow dopamine-panel flex items-center justify-between gap-4 rounded-full px-6 py-4">
          <span className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gold)] text-sm font-bold text-black">{count}</span>
            <span className="text-sm text-white/70">已选 {count} 件 · {formatCurrency(total)}</span>
          </span>
          <span className="font-display text-2xl">去结算 →</span>
        </Link>
      </div>
    </div>
  );
}
