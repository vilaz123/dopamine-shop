"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { productImages } from "@/lib/data/products";
import { optionValueLabel, optionValueDelta } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { formatCurrency } from "@/lib/utils/format";
import { playPop, playChip } from "@/lib/utils/sfx";
import { MediaGallery } from "@/components/common/MediaGallery";
import { CollapsibleStory } from "@/components/common/CollapsibleStory";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { useInView } from "@/lib/utils/useInView";
import { Badge } from "@/components/ui/Badge";

/**
 * 菜单点菜动画版详情页：仿餐厅拿菜单点菜的单列竖向滚动，每个区块进视口才"上菜"
 * （上浮 + 文字逐句浮现），手机优先、app 感。复用 MediaGallery/AddToCart 逻辑等。
 */
export function MenuDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const images = productImages(product);
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
  const total = unit * qty;

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
    <section className="theme-shop relative overflow-hidden pb-24">
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />

      {/* 顶部菜单封皮 Hero */}
      <div className="relative">
        <MediaGallery images={images} alt={product.name} aspect="4/5" auto>
          <div className="absolute left-4 top-4 right-4 flex items-start justify-between">
            <Link href="/shop" className="rounded-full bg-black/40 px-3 py-2 text-xs text-white backdrop-blur transition hover:bg-black/60">← 菜单</Link>
            <FavoriteButton slug={product.slug} />
          </div>
        </MediaGallery>
      </div>

      <div className="container-shell -mt-6 space-y-5 sm:space-y-6">
        {/* 今日推荐卡 */}
        <Section>
          <div className="rounded-[1.25rem] border border-white/60 bg-white/85 p-4 shadow-sm sm:p-5">
            <p className="menu-text text-[11px] uppercase tracking-[0.28em]" style={{ color: "var(--hot)" }}>{product.badge}</p>
            <h1 className="menu-text font-display mt-1 text-xl leading-tight sm:text-2xl" style={{ color: "var(--page-ink)" }}>{product.name}</h1>
            <p className="menu-text mt-1 text-sm" style={{ color: "var(--page-soft)" }}>{product.subtitle}</p>
            <div className="menu-text mt-3 flex items-end justify-between">
              <p className="font-display text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>{formatCurrency(unit)}<span className="ml-1 align-top text-xs font-sans" style={{ color: "var(--page-soft)" }}>虚拟</span></p>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-full border border-black/10 bg-white text-base active:scale-90" style={{ color: "var(--page-ink)" }}>−</button>
                <span className="w-5 text-center font-display" style={{ color: "var(--page-ink)" }}>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="h-8 w-8 rounded-full border border-black/10 bg-white text-base active:scale-90" style={{ color: "var(--page-ink)" }}>+</button>
              </div>
            </div>
          </div>
        </Section>

        {/* 主厨介绍 */}
        <Section>
          <div className="rounded-[1.25rem] border border-white/60 bg-white/75 p-4 backdrop-blur sm:p-5">
            <p className="menu-text text-[11px] uppercase tracking-[0.28em]" style={{ color: "var(--hot)" }}>主厨推荐</p>
            <p className="menu-text mt-2 text-sm leading-7" style={{ color: "var(--page-soft)" }}>{product.description}</p>
          </div>
        </Section>

        {/* 选规格（菜单勾选） */}
        {product.options.length > 0 && (
          <Section>
            <div className="rounded-[1.25rem] border border-white/60 bg-white/75 p-4 backdrop-blur sm:p-5">
              <p className="menu-text text-[11px] uppercase tracking-[0.28em]" style={{ color: "var(--hot)" }}>选规格</p>
              <div className="mt-3 space-y-4">
                {product.options.map((o) => (
                  <div key={o.label}>
                    <p className="menu-text mb-2 text-sm font-semibold" style={{ color: "var(--page-ink)" }}>{o.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {o.values.map((raw) => {
                        const value = optionValueLabel(raw);
                        const delta = optionValueDelta(raw);
                        const isSel = selected[o.label] === value;
                        return (
                          <button
                            key={value}
                            onClick={() => { setSelected((s) => ({ ...s, [o.label]: value })); if (!isSel) playChip(); }}
                            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${isSel ? "menu-check-pop border-[var(--hot)] bg-[var(--hot)] text-white" : "border-black/10 bg-white hover:border-black/30"}`}
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
            </div>
          </Section>
        )}

        {/* 食材故事 */}
        <Section>
          <CollapsibleStory eyebrow="食材故事" title="这道菜的来历">
            <p className="leading-7" style={{ color: "var(--page-soft)" }}>{product.story}</p>
          </CollapsibleStory>
        </Section>

        {/* 凑单推荐 */}
        {related.length > 0 && (
          <Section>
            <p className="menu-text text-[11px] uppercase tracking-[0.28em]" style={{ color: "var(--hot)" }}>再点一份凑单</p>
            <div className="mt-3"><ProductGrid products={related.slice(0, 3)} interactive /></div>
          </Section>
        )}

        {/* 评价 */}
        <Section>
          <ReviewSection productSlug={product.slug} />
        </Section>
      </div>

      {/* 底部固定点单栏（app 感） */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="px-4 pb-[max(0.75rem,env(safe-area-inset-bottom)] pt-3" style={{ background: "color-mix(in srgb, var(--page-bg) 94%, transparent)", borderTop: "1px solid color-mix(in srgb, var(--page-accent) 60%, transparent)", backdropFilter: "blur(10px)" }}>
          <div className="flex items-center gap-2">
            <button onClick={() => order(true)} className="flex-1 rounded-full border border-[color-mix(in_srgb,var(--page-accent)_55%,transparent)] bg-white/70 px-4 py-3 text-sm font-semibold transition active:scale-95" style={{ color: "var(--page-ink)" }}>{added ? "✓ 已加入" : "加入菜单"}</button>
            <button onClick={(e) => { order(false, e.currentTarget); router.push("/checkout"); }} className="flex-[1.3] rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95" style={{ background: `linear-gradient(135deg, ${product.saturation}, ${product.accent})` }}>立即下单 · {formatCurrency(total)}</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 菜单区块：进视口加 .in 触发"上菜"动画 */
function Section({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`menu-section ${inView ? "in" : ""}`}>
      {children}
    </div>
  );
}
