"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/types/product";
import { productImages } from "@/lib/data/products";
import { optionValueLabel, optionValueDelta } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { formatCurrency } from "@/lib/utils/format";
import { playPop, playChip } from "@/lib/utils/sfx";
import { MediaGallery } from "@/components/common/MediaGallery";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { Badge } from "@/components/ui/Badge";

const AUTO_FLIP_MS = 5000;

/**
 * 翻菜单书：全屏覆盖层，仿游戏 app 翻一本菜单书。
 * 一页一个商品：大图自动轮播 + 下方详情/选规格/加购。左右翻页(按钮/手势/键盘)、
 * 自动翻页(手动后暂停)、3D 翻书过渡。覆盖商店区与外卖店。
 */
export function MenuBook({ products, theme = "shop", title = "菜单" }: { products: Product[]; theme?: "shop" | "food"; title?: string }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [flipDir, setFlipDir] = useState<"next" | "prev" | null>(null);
  const [autoPaused, setAutoPaused] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);

  const last = Math.max(0, products.length - 1);
  const product = products[page];

  // 自动翻页（未暂停且多页）
  useEffect(() => {
    if (autoPaused || products.length <= 1) return;
    const t = setInterval(() => {
      setFlipDir("next");
      setPage((p) => (p + 1) % products.length);
      window.setTimeout(() => setFlipDir(null), 500);
    }, AUTO_FLIP_MS);
    return () => clearInterval(t);
  }, [autoPaused, products.length]);

  // 键盘左右
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "Escape") router.back();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function go(dir: 1 | -1) {
    setAutoPaused(true);
    setFlipDir(dir > 0 ? "next" : "prev");
    setPage((p) => (dir > 0 ? (p + 1) % products.length : (p - 1 + products.length) % products.length));
    window.setTimeout(() => setFlipDir(null), 500);
  }

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swiping.current = true;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!swiping.current) return;
    swiping.current = false;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      go(dx < 0 ? 1 : -1);
    }
  }

  if (!product) return null;

  return (
    <div className={`fixed inset-0 z-[100] theme-${theme}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />
      {/* 顶栏：关闭 + 计数 */}
      <div className="container-shell flex h-14 items-center justify-between">
        <button onClick={() => router.back()} className="rounded-full bg-white/70 px-3 py-2 text-sm" style={{ color: "var(--page-ink)" }}>✕ 关闭</button>
        <span className="font-display text-sm" style={{ color: "var(--page-ink)" }}>{title} · {page + 1}/{products.length}</span>
        <span className="w-16" />
      </div>

      {/* 书页 */}
      <div className="menu-book container-shell flex-1">
        <div className={`menu-page ${flipDir ? `flip-${flipDir}` : ""}`} key={product.slug}>
          <MenuPage product={product} />
        </div>
      </div>

      {/* 翻页控制 */}
      <div className="container-shell flex items-center justify-center gap-4 pb-[max(1rem,env(safe-area-inset-bottom)] pt-2">
        <button onClick={() => go(-1)} aria-label="上一页" className="grid h-11 w-11 place-items-center rounded-full border border-white/60 bg-white/70 text-xl active:scale-90" style={{ color: "var(--page-ink)" }}>‹</button>
        <div className="flex gap-1.5">
          {products.slice(0, 12).map((p, i) => (
            <span key={p.slug} className="h-1.5 rounded-full transition-all" style={{ width: i === page ? 16 : 6, background: i === page ? "var(--page-ink)" : "color-mix(in srgb, var(--page-ink) 35%, transparent)" }} />
          ))}
        </div>
        <button onClick={() => go(1)} aria-label="下一页" className="grid h-11 w-11 place-items-center rounded-full border border-white/60 bg-white/70 text-xl active:scale-90" style={{ color: "var(--page-ink)" }}>›</button>
      </div>
    </div>
  );
}

/** 一页：上图 + 下详情/选规格/加购。 */
function MenuPage({ product }: { product: Product }) {
  const images = useMemo(() => productImages(product), [product]);
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.label, optionValueLabel(o.values[0])])),
  );
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const setLastReward = useUiStore((s) => s.setLastReward);
  const triggerFly = useUiStore((s) => s.triggerFly);
  const addRecentlyViewed = useUiStore((s) => s.addRecentlyViewed);
  const grantCoins = useAssetStore((s) => s.grantCoins);
  const pushHistory = useAssetStore((s) => s.pushHistory);
  const [added, setAdded] = useState(false);

  const optionDelta = product.options.reduce(
    (sum, o) => sum + optionValueDelta(o.values.find((v) => optionValueLabel(v) === selected[o.label]) ?? o.values[0]),
    0,
  );
  const unit = product.price + optionDelta;

  function order(openCart: boolean, btn?: HTMLButtonElement) {
    addRecentlyViewed(product.slug);
    pushHistory(product.slug);
    addItem({ slug: product.slug, quantity: qty, options: selected, optionPriceDelta: optionDelta, addedAt: new Date().toISOString() });
    grantCoins(product.rewardCoins * qty);
    setLastReward({ id: `${product.slug}-${Date.now()}`, coins: product.rewardCoins * qty });
    playPop();
    if (btn) {
      const r = btn.getBoundingClientRect();
      triggerFly({ fromX: r.left + r.width / 2, fromY: r.top + r.height / 2, coins: product.rewardCoins * qty, color: "var(--gold)" });
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
    if (openCart) setCartOpen(true);
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pb-2">
      {/* 大图（自动轮播，提速）+ 收藏 */}
      <div className="relative">
        <MediaGallery images={images} alt={product.name} aspect="4/5" auto>
          <div className="absolute right-3 top-3"><FavoriteButton slug={product.slug} /></div>
        </MediaGallery>
      </div>

      {/* 详情 */}
      <div className="rounded-[1rem] border border-white/60 bg-white/80 p-4 backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: "var(--hot)" }}>{product.badge}</p>
        <h2 className="font-display mt-1 text-lg leading-tight sm:text-xl" style={{ color: "var(--page-ink)" }}>{product.name}</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--page-soft)" }}>{product.subtitle}</p>
        <p className="mt-2 text-sm leading-7" style={{ color: "var(--page-soft)" }}>{product.description}</p>

        {/* 选规格 */}
        {product.options.length > 0 && (
          <div className="mt-3 space-y-3">
            {product.options.map((o) => (
              <div key={o.label}>
                <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--page-ink)" }}>{o.label}</p>
                <div className="flex flex-wrap gap-2">
                  {o.values.map((raw) => {
                    const value = optionValueLabel(raw);
                    const delta = optionValueDelta(raw);
                    const isSel = selected[o.label] === value;
                    return (
                      <button
                        key={value}
                        onClick={() => { setSelected((s) => ({ ...s, [o.label]: value })); if (!isSel) playChip(); }}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${isSel ? "menu-check-pop border-[var(--hot)] bg-[var(--hot)] text-white" : "border-black/10 bg-white"}`}
                        style={isSel ? undefined : { color: "var(--page-ink)" }}
                      >
                        {value}{delta ? ` +¥${delta}` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 数量 + 价 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-full border border-black/10 bg-white active:scale-90" style={{ color: "var(--page-ink)" }}>−</button>
            <span className="w-5 text-center font-display" style={{ color: "var(--page-ink)" }}>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="h-8 w-8 rounded-full border border-black/10 bg-white active:scale-90" style={{ color: "var(--page-ink)" }}>+</button>
          </div>
          <p className="font-display text-xl sm:text-2xl" style={{ color: "var(--page-ink)" }}>{formatCurrency(unit * qty)}<span className="ml-1 align-top text-xs font-sans" style={{ color: "var(--page-soft)" }}>虚拟</span></p>
        </div>

        {/* 加购 */}
        <div className="mt-3 flex gap-2">
          <button onClick={() => order(true)} className="flex-1 rounded-full border border-[color-mix(in_srgb,var(--page-accent)_55%,transparent)] bg-white/70 px-4 py-3 text-sm font-semibold transition active:scale-95" style={{ color: "var(--page-ink)" }}>{added ? "✓ 已加入" : "加入购物车"}</button>
          <button onClick={(e) => { order(false, e.currentTarget); router.push("/checkout"); }} className="flex-[1.3] rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95" style={{ background: `linear-gradient(135deg, ${product.saturation}, ${product.accent})` }}>立即下单</button>
        </div>
      </div>
    </div>
  );
}
