"use client";

import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import { optionValueDelta, optionValueLabel } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";

export function CartOptionEditor({ item, product }: { item: CartItem; product: Product }) {
  const updateOptions = useCartStore((state) => state.updateOptions);

  function update(label: string, value: string) {
    const nextOptions = { ...item.options, [label]: value };
    const delta = product.options.reduce((sum, option) => {
      const selected = nextOptions[option.label];
      const raw = option.values.find((entry) => optionValueLabel(entry) === selected) ?? option.values[0];
      return sum + optionValueDelta(raw);
    }, 0);
    updateOptions(item.slug, item.options, nextOptions, delta, item.giftWrap);
  }

  return (
    <div className="mt-4 space-y-3">
      {product.options.map((option) => (
        <div key={option.label}>
          <p className="mb-2 text-xs font-semibold text-[var(--muted)]">{option.label}</p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((raw) => {
              const value = optionValueLabel(raw);
              const delta = optionValueDelta(raw);
              const active = item.options[option.label] === value;
              return (
                <button
                  key={value}
                  onClick={() => update(option.label, value)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${active ? "border-black bg-black text-[var(--bone)]" : "border-black/10 hover:border-black/30"}`}
                >
                  {value}{delta ? ` +¥${delta}` : ""}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
