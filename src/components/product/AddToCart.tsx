"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/Button";

export function AddToCart({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((option) => [option.label, option.values[0]])),
  );
  const optionText = useMemo(() => Object.values(selected).join(" / "), [selected]);

  return (
    <div className="space-y-6">
      {product.options.map((option) => (
        <div key={option.label}>
          <p className="mb-3 text-sm font-semibold">{option.label}</p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => (
              <button
                key={value}
                onClick={() => setSelected((state) => ({ ...state, [option.label]: value }))}
                className={`rounded-full border px-4 py-2 text-sm transition ${selected[option.label] === value ? "border-black bg-black text-[#f6f1e8]" : "border-black/10 hover:border-black/30"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Button
        className="w-full"
        onClick={() => {
          addItem({ slug: product.slug, quantity: 1, options: selected });
          setCartOpen(true);
        }}
      >
        加入虚拟购物车 · {optionText}
      </Button>
    </div>
  );
}
