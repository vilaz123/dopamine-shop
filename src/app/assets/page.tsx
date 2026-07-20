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
      <h1 className="font-display mt-4 text-4xl sm:text-6xl" style={{ color: "var(--page-ink)" }}>我的多巴胺资产</h1>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 sm:mt-10 md:grid-cols-3">
        <div className="rounded-[2rem] bg-[var(--ink)] p-7 text-[var(--bone)]"><p className="text-sm text-white/60">虚拟钱包</p><p className="font-display mt-2 text-5xl">{coins} 币</p></div>
        <div className="rounded-[2rem] bg-white p-7"><p className="text-sm text-[var(--muted)]">会员等级</p><p className="font-display mt-2 text-5xl">Lv.{level.level}</p><p className="mt-2 text-sm text-[var(--muted)]">{level.title} · {xp}/{level.xpToNext} XP</p></div>
        <div className="rounded-[2rem] bg-white p-7"><p className="text-sm text-[var(--muted)]">优惠券</p><p className="font-display mt-2 text-5xl">{coupons.length} 张</p><p className="mt-2 text-sm text-[var(--muted)]">可在虚拟结算中使用</p></div>
      </div>

      <section className="mt-14"><h2 className="font-display mb-6 text-4xl">我的勋章</h2><div className="flex flex-wrap gap-3">{badges.length ? badges.map((badge) => <span key={badge.id} className="rounded-full bg-white px-5 py-3 text-sm">{badge.icon} {badge.name}</span>) : <p className="text-[var(--muted)]">还没有勋章，下一单就会解锁。</p>}</div></section>

      <section className="mt-12 sm:mt-14"><h2 className="font-display mb-5 text-3xl sm:mb-6 sm:text-4xl">虚拟囤货库存</h2><div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{inventoryProducts.length ? inventoryProducts.map(({ product, count }) => <div key={product.slug} className="rounded-[1.25rem] bg-white p-3 sm:rounded-[2rem] sm:p-4"><ProductMonogram product={product} /><p className="font-display mt-3 text-xl sm:mt-4 sm:text-2xl">{product.name}</p><p className="text-sm text-[var(--muted)]">已拥有 ×{count}</p></div>) : <p className="text-[var(--muted)]">还没有囤货。</p>}</div></section>

      {favoriteProducts.length > 0 && <section className="mt-14"><h2 className="font-display mb-8 text-4xl">收藏夹</h2><ProductGrid products={favoriteProducts} /></section>}
      {historyProducts.length > 0 && <section className="mt-14"><h2 className="font-display mb-8 text-4xl">最近种草</h2><ProductGrid products={historyProducts} /></section>}
      <Button variant="ghost" className="mt-14" onClick={resetAssets}>重置虚拟资产</Button>
    </section>
    </PageTheme>
  );
}
