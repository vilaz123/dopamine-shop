"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { optionValueLabel, optionValueDelta } from "@/types/product";
import { playPop } from "@/lib/utils/sfx";
import { FavoriteButton } from "./FavoriteButton";
import { AddToCart } from "./AddToCart";

/**
 * 商品详情页手机底部固定操作栏（md:hidden，桌面不渲染）。
 * 左：收藏图标；中：加入购物车（点开底部抽屉选规格）；右：立即下单（渐变）。
 * 「立即下单」走默认规格直接加购并跳 /checkout（快路径）；
 * 「加入购物车」弹抽屉复用 AddToCart 选规格，保留飞金币/音效情绪反馈。
 */
export function DetailActionBar({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const triggerFly = useUiStore((state) => state.triggerFly);
  const addRecentlyViewed = useUiStore((state) => state.addRecentlyViewed);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const pushHistory = useAssetStore((state) => state.pushHistory);

  function buyNow(btn: HTMLButtonElement) {
    const selected = Object.fromEntries(product.options.map((o) => [o.label, optionValueLabel(o.values[0])]));
    const delta = product.options.reduce((sum, o) => sum + optionValueDelta(o.values[0]), 0);
    addRecentlyViewed(product.slug);
    pushHistory(product.slug);
    addItem({ slug: product.slug, quantity: 1, options: selected, optionPriceDelta: delta, addedAt: new Date().toISOString() });
    grantCoins(product.rewardCoins);
    setLastReward({ id: `${product.slug}-${Date.now()}`, coins: product.rewardCoins });
    playPop();
    const r = btn.getBoundingClientRect();
    triggerFly({ fromX: r.left + r.width / 2, fromY: r.top + r.height / 2, coins: product.rewardCoins, color: "var(--gold)" });
    router.push("/checkout");
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div
          className="px-4 pb-[max(0.75rem,env(safe-area-inset-bottom)] pt-3"
          style={{ background: "color-mix(in srgb, var(--page-bg) 92%, transparent)", borderTop: "1px solid color-mix(in srgb, var(--page-accent) 60%, transparent)", backdropFilter: "blur(10px)" }}
        >
          <div className="flex items-center gap-2">
            <span className="shrink-0">
              <FavoriteButton slug={product.slug} />
            </span>
            <button
              onClick={() => setOpen(true)}
              className="flex-1 rounded-full border border-[color-mix(in_srgb,var(--page-accent)_55%,transparent)] bg-white/70 px-4 py-3 text-sm font-semibold transition active:scale-95"
              style={{ color: "var(--page-ink)" }}
            >
              加入购物车
            </button>
            <button
              onClick={(e) => buyNow(e.currentTarget)}
              className="flex-[1.4] rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${product.saturation}, ${product.accent})` }}
            >
              立即下单
            </button>
          </div>
        </div>
      </div>

      {/* 底部抽屉：选规格 + 加购，复用 AddToCart 的全部逻辑 */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-[1.5rem] p-5 shadow-2xl" style={{ background: "var(--page-bg)" }}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg" style={{ color: "var(--page-ink)" }}>选规格</p>
              <button onClick={() => setOpen(false)} className="rounded-full border border-[color-mix(in_srgb,var(--page-accent)_55%,transparent)] bg-white/70 px-3 py-1.5 text-sm" style={{ color: "var(--page-ink)" }}>关闭</button>
            </div>
            <AddToCart product={product} sticky />
          </div>
        </div>
      )}
    </>
  );
}
