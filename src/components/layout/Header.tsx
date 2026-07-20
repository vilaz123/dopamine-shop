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
    <>
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
    </header>
    {open && (
      /* 抽屉放在 header 之外：header 的 backdrop-blur 会让 fixed 后代以 header 为包含块，
         导致抽屉被压缩进 header 高度。移到此处即相对 viewport 正常全屏。 */
      <div className="fixed inset-0 z-[999] md:hidden">
        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
        <aside className="absolute right-0 top-0 z-10 flex h-full w-[68vw] min-w-[240px] max-w-[300px] flex-col overflow-y-auto p-4 shadow-2xl" style={{ background: "var(--page-bg)" }}>
          <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] pb-3">
            <p className="font-display text-lg" style={{ color: "var(--page-ink)" }}>菜单</p>
            <button className="rounded-full border border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] bg-white/70 p-1.5" onClick={() => setOpen(false)} aria-label="关闭菜单" style={{ color: "var(--page-ink)" }}><X size={16} /></button>
          </div>
          <nav className="mt-3 grid gap-1.5">
            {navItems.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl border border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] bg-white/70 px-3.5 py-2.5 text-sm font-semibold transition hover:bg-white" style={{ color: "var(--page-ink)" }}>
                {label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    )}
    </>
  );
}
