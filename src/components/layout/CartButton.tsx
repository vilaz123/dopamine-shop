"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";

export function CartButton() {
  const items = useCartStore((state) => state.items);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <button onClick={() => setCartOpen(true)} className="relative rounded-full border border-black/10 p-3 transition hover:border-black/30" aria-label="打开购物车">
      <ShoppingBag size={18} />
      {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--ink)] px-1 text-[11px] text-[var(--bone)]">{count}</span>}
    </button>
  );
}
