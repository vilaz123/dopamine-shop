"use client";

import { useEffect, useMemo, useState } from "react";
import { categories } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { withBasePath } from "@/lib/utils/path";
import { ProductGrid } from "@/components/product/ProductGrid";

export default function ShopPage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("hot");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get("category") ?? "all");
    setSort(params.get("sort") ?? "hot");
  }, []);

  function updateQuery(nextCategory = category, nextSort = sort) {
    setCategory(nextCategory);
    setSort(nextSort);
    const params = new URLSearchParams({ category: nextCategory, sort: nextSort });
    window.history.replaceState(null, "", withBasePath(`/shop/?${params.toString()}`));
  }

  const sorted = useMemo(() => {
    const pool = products.filter((product) => product.category !== "food-delivery" && product.category !== "snacks");
    const filtered = category === "all" ? pool : pool.filter((product) => product.category === category);
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.sold - a.sold;
    });
  }, [category, sort]);

  return (
    <section className="theme-shop relative overflow-hidden">
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />
      <div className="container-shell py-10 sm:py-16">
      <div className="mb-8 max-w-3xl sm:mb-12">
        <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Cyber Restock</p>
        <h1 className="font-display mt-3 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>赛博进货部</h1>
        <p className="mt-4 text-base leading-7 sm:text-lg sm:leading-8" style={{ color: "var(--page-soft)" }}>复刻真实电商信息流：热榜、满减、新品、稀缺库存都在，但所有价格都是虚拟金额，无需真实支付。</p>
      </div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
          {categories.map((item) => (
            <button key={item.id} onClick={() => updateQuery(item.id, sort)} className={`shrink-0 rounded-full border px-3 py-2 text-sm transition sm:px-4 ${category === item.id ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {[
            ["hot", "热度"],
            ["price-asc", "价格升序"],
            ["price-desc", "价格降序"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => updateQuery(category, id)} className={`shrink-0 ${sort === id ? "font-semibold" : "opacity-70"}`} style={{ color: "var(--page-ink)" }}>{label}</button>
          ))}
        </div>
      </div>
      <ProductGrid products={sorted} interactive />
      </div>
    </section>
  );
}
