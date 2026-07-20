"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { CartButton } from "./CartButton";
import { AssetHeaderButton } from "./AssetHeaderButton";

const navItems = [
  ["/shop", "虚拟商店"],
  ["/takeaway", "虚拟外卖"],
  ["/assets", "我的资产"],
  ["/community", "多巴胺广场"],
  ["/orders", "我的订单"],
  ["/profile", "我的账号"],
  ["/about", "产品理念"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] bg-[color-mix(in_srgb,var(--page-bg)_85%,transparent)] backdrop-blur shadow-sm">
      <div className="container-shell flex h-16 items-center justify-between gap-3 sm:h-20 sm:gap-4">
        <Link href="/" className="font-display text-xl tracking-tight sm:text-2xl md:text-3xl" style={{ color: "var(--page-ink)" }}>Dopahub 多巴胺仓</Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {navItems.map(([href, label]) => (
            <Link key={href} href={href} className="font-medium transition hover:opacity-70" style={{ color: "var(--page-soft)" }}>{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <AssetHeaderButton />
          <CartButton />
          <button className="rounded-full border border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] bg-white/60 p-3 md:hidden" onClick={() => setOpen(true)} aria-label="打开菜单" style={{ color: "var(--page-ink)" }}><Menu size={18} /></button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[999] md:hidden" style={{ background: "var(--page-ink)" }}>
          <button className="absolute inset-y-0 left-0 right-[68vw] min-w-[calc(100vw-300px)]" onClick={() => setOpen(false)} aria-label="关闭菜单遮罩" />
          <aside className="absolute right-0 top-0 h-full w-[68vw] min-w-[248px] max-w-[300px] p-5 shadow-2xl" style={{ background: "var(--page-bg)" }}>
            <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] pb-5">
              <p className="font-display text-3xl" style={{ color: "var(--page-ink)" }}>菜单</p>
              <button className="rounded-full border border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] bg-white/60 p-2" onClick={() => setOpen(false)} aria-label="关闭菜单" style={{ color: "var(--page-ink)" }}><X size={18} /></button>
            </div>
            <nav className="mt-8 grid gap-3">
              {navItems.map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl border border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] bg-white/60 px-5 py-4 text-lg font-semibold transition hover:bg-white" style={{ color: "var(--page-soft)" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
