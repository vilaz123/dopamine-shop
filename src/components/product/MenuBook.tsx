"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { productImages } from "@/lib/data/products";
import { optionValueLabel, optionValueDelta } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { formatCurrency } from "@/lib/utils/format";
import { playPop, playChip, playFlip } from "@/lib/utils/sfx";
import { MediaGallery } from "@/components/common/MediaGallery";
import { FavoriteButton } from "@/components/product/FavoriteButton";

const AUTO_FLIP_MS = 6000;

/**
 * 翻菜单书：全屏，仿真实一本翻开的书（书脊/叠层页边）。
 * 一页一商品，页内固定不滚动（图+名+价+翻页提示），「详情/选规格」弹窗。
 * 翻页有 3D 翻书动画 + 纸声；左右大箭头常驻提示；自动翻页(手动后暂停)。
 */
export function MenuBook({ products, theme = "shop", title = "菜单" }: { products: Product[]; theme?: "shop" | "food"; title?: string }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [flipDir, setFlipDir] = useState<"next" | "prev" | null>(null);
  const [autoPaused, setAutoPaused] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);

  const last = Math.max(0, products.length - 1);
  const product = products[page];

  // 自动翻页
  useEffect(() => {
    if (autoPaused || products.length <= 1) return;
    const t = setInterval(() => flip(1), AUTO_FLIP_MS);
    return () => clearInterval(t);
  }, [autoPaused, products.length]);

  // 键盘
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") flip(-1);
      else if (e.key === "ArrowRight") flip(1);
      else if (e.key === "Escape") { if (showDetail) setShowDetail(false); else router.back(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function flip(dir: 1 | -1) {
    if (products.length <= 1) return;
    setAutoPaused(true);
    setFlipDir(dir > 0 ? "next" : "prev");
    playFlip();
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
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) flip(dx < 0 ? 1 : -1);
  }

  if (!product) return null;

  return (
    <div className={`fixed inset-0 z-[100] theme-${theme}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />

      {/* 顶栏 */}
      <div className="container-shell flex h-14 items-center justify-between">
        <button onClick={() => router.back()} className="rounded-full bg-white/70 px-3 py-2 text-sm" style={{ color: "var(--page-ink)" }}>✕ 关闭</button>
        <span className="font-display text-sm" style={{ color: "var(--page-ink)" }}>{title} · {page + 1}/{products.length}</span>
        <span className="w-16" />
      </div>

      {/* 书本主体 */}
      <div className="container-shell flex flex-1 flex-col px-3">
        <div className="menu-book relative flex-1">
          {/* 左右翻页大箭头（常驻提示） */}
          <button onClick={() => flip(-1)} aria-label="上一页" className="menu-flip-arrow absolute left-0 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/70 text-2xl shadow-md sm:h-14 sm:w-14" style={{ color: "var(--page-ink)" }}>‹</button>
          <button onClick={() => flip(1)} aria-label="下一页" className="menu-flip-arrow absolute right-0 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/70 text-2xl shadow-md sm:h-14 sm:w-14" style={{ color: "var(--page-ink)" }}>›</button>

          {/* 书页：硬封皮 + 中央书脊 + 页面区 + 翻页折角 */}
          <div className="menu-book-cover relative h-full min-h-[60vh] p-3 sm:p-4">
            {/* 中央书脊 */}
            <div className="menu-book-spine" aria-hidden />
            {/* 页面区（白纸） */}
            <div className="menu-book-page relative h-full overflow-hidden p-4 sm:p-6">
              {/* 翻页层：盖在页面上，翻页时整页折起 */}
              <div className={`menu-page absolute inset-0 p-4 sm:p-6 ${flipDir ? `flip-${flipDir}` : ""}`} key={product.slug}>
                {/* 固定页：轮播图 + 名 + 价 + 操作（手机一屏可见，不滚） */}
                <div className="flex h-full flex-col items-center gap-3">
                  <div className="relative aspect-square w-full max-w-[58vw] overflow-hidden rounded-xl shadow-md">
                    <MediaGallery images={productImages(product)} alt={product.name} aspect="4/5" auto>
                      <div className="absolute right-2 top-2"><FavoriteButton slug={product.slug} /></div>
                    </MediaGallery>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--hot)" }}>{product.badge}</p>
                  <h2 className="font-display text-center text-lg leading-tight sm:text-xl" style={{ color: "var(--page-ink)" }}>{product.name}</h2>
                  <p className="font-display text-xl sm:text-2xl" style={{ color: "var(--page-ink)" }}>{formatCurrency(product.price)}<span className="ml-1 align-top text-xs font-sans" style={{ color: "var(--page-soft)" }}>虚拟</span></p>
                  <button onClick={() => setShowDetail(true)} className="rounded-full border border-[color-mix(in_srgb,var(--page-accent)_55%,transparent)] bg-white/70 px-5 py-2 text-sm font-semibold transition active:scale-95" style={{ color: "var(--page-ink)" }}>详情 / 选规格</button>
                </div>
                {/* 右下折角提示可翻 */}
                <span className="menu-page-corner" aria-hidden />
              </div>
            </div>
          </div>

          {/* 底部翻页提示 + 圆点 */}
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-[11px]" style={{ color: "var(--page-soft)" }}>← 左右滑动或点箭头翻页 →</span>
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-1.5 pb-[max(1rem,env(safe-area-inset-bottom)]">
            {products.slice(0, 12).map((p, i) => (
              <span key={p.slug} className="h-1.5 rounded-full transition-all" style={{ width: i === page ? 16 : 6, background: i === page ? "var(--page-ink)" : "color-mix(in srgb, var(--page-ink) 35%, transparent)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* 详情/选规格弹窗 */}
      {showDetail && <MenuDetailSheet product={product} onClose={() => setShowDetail(false)} />}
    </div>
  );
}

/** 详情/选规格/加购 弹窗（底部抽屉）。 */
function MenuDetailSheet({ product, onClose }: { product: Product; onClose: () => void }) {
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
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 max-h-[88vh] slide-up">
        <div className="max-h-[88vh] overflow-y-auto rounded-t-[1.5rem] bg-white p-5 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-base" style={{ color: "var(--page-ink)" }}>{product.name}</p>
            <button onClick={onClose} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm" style={{ color: "var(--page-ink)" }}>关闭</button>
          </div>
          <p className="text-sm leading-7" style={{ color: "var(--page-ink)" }}>{product.description}</p>
          {product.story && <p className="mt-2 text-xs leading-6" style={{ color: "var(--page-ink)" }}>🍽 {product.story}</p>}

          {product.options.length > 0 && (
            <div className="mt-4 space-y-3">
              {product.options.map((o) => (
                <div key={o.label}>
                  <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--page-ink)" }}>{o.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {o.values.map((raw) => {
                      const value = optionValueLabel(raw);
                      const delta = optionValueDelta(raw);
                      const isSel = selected[o.label] === value;
                      return (
                        <button key={value} onClick={() => { setSelected((s) => ({ ...s, [o.label]: value })); if (!isSel) playChip(); }} className={`rounded-full border px-3 py-1.5 text-sm transition ${isSel ? "menu-check-pop border-[var(--hot)] bg-[var(--hot)] text-white" : "border-black/10 bg-white"}`} style={isSel ? undefined : { color: "var(--page-ink)" }}>
                          {value}{delta ? ` +¥${delta}` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-full border border-black/10 bg-white active:scale-90" style={{ color: "var(--page-ink)" }}>−</button>
              <span className="w-5 text-center font-display" style={{ color: "var(--page-ink)" }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="h-8 w-8 rounded-full border border-black/10 bg-white active:scale-90" style={{ color: "var(--page-ink)" }}>+</button>
            </div>
            <p className="font-display text-xl sm:text-2xl" style={{ color: "var(--page-ink)" }}>{formatCurrency(unit * qty)}</p>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => order(true)} className="flex-1 rounded-full border border-[color-mix(in_srgb,var(--page-accent)_55%,transparent)] bg-white/70 px-4 py-3 text-sm font-semibold transition active:scale-95" style={{ color: "var(--page-ink)" }}>{added ? "✓ 已加入" : "加入购物车"}</button>
            <button onClick={(e) => { order(false, e.currentTarget); router.push("/checkout"); onClose(); }} className="flex-[1.3] rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95" style={{ background: `linear-gradient(135deg, ${product.saturation}, ${product.accent})` }}>立即下单</button>
          </div>
        </div>
      </div>
    </div>
  );
}
