"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { CartButton } from "./CartButton";
import { AssetHeaderButton } from "./AssetHeaderButton";

type NavItem = { href: string; label: string; emoji: string };

const navItems: NavItem[] = [
  { href: "/shop", label: "赛博进货部", emoji: "🛍" },
  { href: "/blindbox", label: "赌一把盲盒", emoji: "🎲" },
  { href: "/takeaway", label: "卡路里投影区", emoji: "🛵" },
  { href: "/assets", label: "我的资产", emoji: "💰" },
  { href: "/community", label: "多巴胺广场", emoji: "🎤" },
  { href: "/orders", label: "我的订单", emoji: "📦" },
  { href: "/profile", label: "我的账号", emoji: "🙂" },
  { href: "/about", label: "产品理念", emoji: "💡" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] bg-[color-mix(in_srgb,var(--page-bg)_85%,transparent)] backdrop-blur shadow-sm">
        <div className="container-shell flex h-16 items-center justify-between gap-3 sm:h-20 sm:gap-4">
          <Link href="/" className="min-w-0 truncate font-display text-lg tracking-tight sm:text-2xl md:text-3xl" style={{ color: "var(--page-ink)" }}>Dopahub 多巴胺仓</Link>
          <nav className="hidden items-center gap-1.5 text-sm md:flex lg:gap-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-card group inline-flex items-center gap-1.5 rounded-full border px-3 py-2 font-medium transition lg:px-3.5 ${active ? "nav-card-active" : "border-transparent hover:-translate-y-0.5"}`}
                  style={
                    active
                      ? { borderColor: "color-mix(in srgb, var(--page-accent) 70%, transparent)" }
                      : { color: "var(--page-soft)" }
                  }
                >
                  <span className="text-base leading-none transition-transform group-hover:scale-110">{item.emoji}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
          <aside className="absolute right-0 top-0 z-10 flex h-full w-[68vw] min-w-[240px] max-w-[320px] flex-col overflow-y-auto p-4 shadow-2xl" style={{ background: "var(--page-bg)" }}>
            <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] pb-3">
              <p className="font-display text-lg" style={{ color: "var(--page-ink)" }}>菜单</p>
              <button className="rounded-full border border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] bg-white/70 p-1.5" onClick={() => setOpen(false)} aria-label="关闭菜单" style={{ color: "var(--page-ink)" }}><X size={16} /></button>
            </div>
            <nav className="mt-3 grid gap-1.5">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`nav-card inline-flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${active ? "nav-card-active" : "border-[color-mix(in_srgb,var(--page-accent)_60%,transparent)] bg-white/70 hover:bg-white"}`}
                    style={active ? { borderColor: "color-mix(in srgb, var(--page-accent) 70%, transparent)" } : { color: "var(--page-ink)" }}
                  >
                    <span className="text-lg leading-none">{item.emoji}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
