"use client";

import { products } from "@/lib/data/products";
import { selectLevel, useAssetStore } from "@/stores/asset-store";
import { PageTheme } from "@/components/common/PageTheme";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductMonogram } from "@/components/product/ProductMonogram";
import { Button } from "@/components/ui/Button";

export default function AssetsPage() {
  const { coins, xp, badges, coupons, inventory, favorites, history, resetAssets } = useAssetStore();
  const level = selectLevel(xp);
  const inventoryProducts = Object.entries(inventory).map(([slug, count]) => ({ product: products.find((p) => p.slug === slug), count })).filter((item): item is { product: (typeof products)[number]; count: number } => Boolean(item.product));
  const favoriteProducts = favorites.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is (typeof products)[number] => Boolean(p));
  const historyProducts = history.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is (typeof products)[number] => Boolean(p)).slice(0, 6);

  return (
    <PageTheme className="min-h-screen">
    <section className="container-shell py-10 sm:py-16">
      <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Dopahub Assets</p>
      <h1 className="font-display mt-3 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>我的多巴胺资产</h1>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:gap-4 sm:mt-10 md:grid-cols-3">
        <div className="dopamine-panel rounded-[1rem] p-4 sm:rounded-[1.25rem] sm:p-5"><p className="text-xs text-white/75">虚拟钱包</p><p className="font-display mt-1 break-words text-2xl sm:text-3xl">{coins} 币</p></div>
        <div className="rounded-[1rem] border border-white/50 bg-white/65 p-4 backdrop-blur sm:rounded-[1.25rem] sm:p-5"><p className="text-xs text-[var(--muted)]">会员等级</p><p className="font-display mt-1 text-2xl sm:text-3xl">Lv.{level.level}</p><p className="mt-1 text-xs text-[var(--muted)]">{level.title} · {xp}/{level.xpToNext} XP</p></div>
        <div className="rounded-[1rem] border border-white/50 bg-white/65 p-4 backdrop-blur sm:rounded-[1.25rem] sm:p-5"><p className="text-xs text-[var(--muted)]">优惠券</p><p className="font-display mt-1 text-2xl sm:text-3xl">{coupons.length} 张</p><p className="mt-1 text-xs text-[var(--muted)]">可在虚拟结算中使用</p></div>
      </div>

      <section className="mt-8 sm:mt-10"><h2 className="font-display mb-3 text-base sm:text-lg" style={{ color: "var(--page-ink)" }}>我的勋章</h2><div className="flex flex-wrap gap-2.5">{badges.length ? badges.map((badge) => <span key={badge.id} className="rounded-full border border-white/50 bg-white/65 px-3.5 py-2 text-sm backdrop-blur">{badge.icon} {badge.name}</span>) : <p className="text-sm text-[var(--muted)]">还没有勋章，下一单就会解锁。</p>}</div></section>

      <section className="mt-8 sm:mt-10"><h2 className="font-display mb-4 text-base sm:text-lg" style={{ color: "var(--page-ink)" }}>虚拟囤货库存</h2><div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">{inventoryProducts.length ? inventoryProducts.map(({ product, count }) => <div key={product.slug} className="rounded-[1rem] border border-white/50 bg-white/65 p-3 backdrop-blur sm:rounded-[1.25rem] sm:p-3.5"><ProductMonogram product={product} /><p className="font-display mt-2.5 text-sm sm:text-base" style={{ color: "var(--page-ink)" }}>{product.name}</p><p className="mt-0.5 text-xs text-[var(--muted)]">已拥有 ×{count}</p></div>) : <p className="text-sm text-[var(--muted)]">还没有囤货。</p>}</div></section>

      {favoriteProducts.length > 0 && <section className="mt-8 sm:mt-10"><h2 className="font-display mb-4 text-base sm:text-lg" style={{ color: "var(--page-ink)" }}>收藏夹</h2><ProductGrid products={favoriteProducts} /></section>}
      {historyProducts.length > 0 && <section className="mt-8 sm:mt-10"><h2 className="font-display mb-4 text-base sm:text-lg" style={{ color: "var(--page-ink)" }}>最近种草</h2><ProductGrid products={historyProducts} /></section>}
      <Button variant="ghost" className="mt-8" onClick={resetAssets}>重置虚拟资产</Button>
    </section>
    </PageTheme>
  );
}
