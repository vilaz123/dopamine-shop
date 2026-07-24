"use client";

import { useMemo } from "react";
import { takeawayShops } from "@/lib/data/takeaway-shops";
import { products } from "@/lib/data/products";
import { ProductShowcaseGrid } from "@/components/product/ProductShowcaseGrid";
import { TakeawayShopShowcase } from "@/components/takeaway/TakeawayShopShowcase";

/**
 * 展示柜改造预览：参照盲盒轮转展示柜，把外卖店卡和商店商品卡升级成
 * 竖向大卡 + 自动轮播 + 进视口入场 + 桌面 3D 倾斜 + 热度条。
 * 这里是独立预览页，原 /shop、/takeaway 页面未改动，便于对比新旧。
 */
export default function ShowcasePreviewPage() {
  const shops = useMemo(() => takeawayShops.slice(0, 6), []);
  const shopProducts = useMemo(
    () => products.filter((p) => p.category !== "food-delivery" && p.category !== "snacks").slice(0, 6),
    [],
  );

  return (
    <section className="theme-home relative overflow-hidden">
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />
      <div className="container-shell py-10 sm:py-16">
        <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--hot)" }}>
          Preview · 新版展示柜
        </p>
        <h1 className="font-display mt-3 text-3xl leading-tight sm:text-5xl" style={{ color: "var(--page-ink)" }}>
          展示柜改造预览
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8" style={{ color: "var(--page-soft)" }}>
          参照盲盒轮转展示柜，把外卖店卡和商店商品卡升级成竖向大卡：商品/店铺图自动轮播、进视口错峰入场、桌面 3D 倾斜、霓虹描边、热度条。这里是预览，原页面未动，可对比后决定去留。
        </p>

        {/* 商店区新版（theme-shop 风） */}
        <div className="theme-shop relative mt-10 overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--page-accent)_55%,transparent)] p-5 sm:mt-12 sm:p-8">
          <div className="page-paint absolute inset-0 -z-10 rounded-[2rem]" aria-hidden />
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--page-ink)" }}>
            Shop · 商店区新版
          </p>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>
            商品展示柜
          </h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--page-soft)" }}>
            点图或「查看详情」进商品详情；❤ 收藏；图自动轮播，hover 暂停。
          </p>
          <div className="mt-6">
            <ProductShowcaseGrid products={shopProducts} />
          </div>
        </div>

        {/* 外卖区新版（theme-food 风） */}
        <div className="theme-food relative mt-8 overflow-hidden rounded-[2rem] border border-white/20 p-5 sm:p-8">
          <div className="page-paint absolute inset-0 -z-10 rounded-[2rem]" aria-hidden />
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--page-highlight)" }}>
            Takeaway · 外卖区新版
          </p>
          <h2 className="font-display mt-2 text-2xl text-white sm:text-3xl">店铺展示柜</h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--page-soft)" }}>
            点图或「进店」进店铺；「一键下单」直奔结算；图自动轮播，hover 暂停。
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop, i) => (
              <TakeawayShopShowcase key={shop.slug} shop={shop} priority={i < 3} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
