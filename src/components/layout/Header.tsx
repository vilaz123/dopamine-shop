"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { CartButton } from "./CartButton";
import { AssetHeaderButton } from "./AssetHeaderButton";

const navItems = [
  ["/shop", "虚拟商店"],
  ["/assets", "我的资产"],
  ["/community", "多巴胺广场"],
  ["/orders", "我的订单"],
  ["/profile", "我的账号"],
  ["/about", "产品理念"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f1e8]/90 backdrop-blur">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-tight md:text-3xl">Dopahub 多巴胺仓</Link>
        <nav className="hidden items-center gap-7 text-sm text-[#554c43] md:flex">
          {navItems.map(([href, label]) => <Link key={href} href={href} className="hover:text-black">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-3">
          <AssetHeaderButton />
          <CartButton />
          <button className="rounded-full border border-black/10 p-3 md:hidden" onClick={() => setOpen(true)} aria-label="打开菜单"><Menu size={18} /></button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="关闭菜单遮罩" />
          <aside className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-[#fffaf2] p-6 shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-black/10 pb-5">
              <p className="font-display text-3xl">菜单</p>
              <button className="rounded-full border border-black/10 p-2" onClick={() => setOpen(false)} aria-label="关闭菜单"><X size={18} /></button>
            </div>
            <nav className="mt-8 grid gap-3">
              {navItems.map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl border border-black/10 px-5 py-4 text-lg font-semibold text-[#554c43] hover:border-black/30 hover:text-black">
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
