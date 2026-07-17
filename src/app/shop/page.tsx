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
      <div className="container-shell py-16">
      <div className="mb-12 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Dopahub Market</p>
        <h1 className="font-display mt-4 text-6xl" style={{ color: "var(--page-ink)" }}>多巴胺仓货架</h1>
        <p className="mt-5 text-lg leading-8" style={{ color: "var(--page-soft)" }}>复刻真实电商信息流：热榜、满减、新品、稀缺库存都在，但所有价格都是虚拟金额，无需真实支付。</p>
      </div>
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex flex-wrap gap-3">
          {categories.map((item) => (
            <button key={item.id} onClick={() => updateQuery(item.id, sort)} className={`rounded-full border px-4 py-2 text-sm transition ${category === item.id ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-sm">
          {[
            ["hot", "热度"],
            ["price-asc", "价格升序"],
            ["price-desc", "价格降序"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => updateQuery(category, id)} className={sort === id ? "font-semibold" : "opacity-70"} style={{ color: "var(--page-ink)" }}>{label}</button>
          ))}
        </div>
      </div>
      <ProductGrid products={sorted} />
      </div>
    </section>
  );
}
