"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { MenuBook } from "@/components/product/MenuBook";

/**
 * 外卖店「本店菜单」入口：client 包装，点开 MenuBook 翻菜单书。
 * 外卖店详情页是 server component，用此 client 按钮持有 open 态。
 */
export function TakeawayMenuButton({ meals }: { meals: Product[] }) {
  const [open, setOpen] = useState(false);
  if (meals.length === 0) return null;
  return (
    <>
      <button onClick={() => setOpen(true)} className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:opacity-90 active:scale-95" style={{ background: "var(--gold)" }}>📖 翻菜单</button>
      {open && <MenuBook products={meals} theme="food" title="本店菜单" />}
    </>
  );
}
