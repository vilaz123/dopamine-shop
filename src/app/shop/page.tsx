"use client";

import { useEffect, useMemo, useState } from "react";
import { categories } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";

export default function ShopPage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get("category") ?? "all");
    setSort(params.get("sort") ?? "featured");
  }, []);

  function updateQuery(nextCategory = category, nextSort = sort) {
    setCategory(nextCategory);
    setSort(nextSort);
    const params = new URLSearchParams({ category: nextCategory, sort: nextSort });
    window.history.replaceState(null, "", `/shop/?${params.toString()}`);
  }

  const sorted = useMemo(() => {
    const filtered = category === "all" ? products : products.filter((product) => product.category === category);
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });
  }, [category, sort]);

  return (
    <section className="container-shell py-16">
      <div className="mb-12 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">Shop the unreal</p>
        <h1 className="font-display mt-4 text-6xl">虚拟商店</h1>
        <p className="mt-5 text-lg leading-8 text-[#7a7167]">库存无限，配送永远悬而未决。请选择一个想买但可以先不买的东西。</p>
      </div>
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex flex-wrap gap-3">
          {categories.map((item) => (
            <button key={item.id} onClick={() => updateQuery(item.id, sort)} className={`rounded-full border px-4 py-2 text-sm transition ${category === item.id ? "border-black bg-black text-[#f6f1e8]" : "border-black/10 hover:border-black/30"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-sm">
          {[
            ["featured", "精选"],
            ["price-asc", "价格升序"],
            ["price-desc", "价格降序"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => updateQuery(category, id)} className={sort === id ? "font-semibold" : "text-[#7a7167]"}>{label}</button>
          ))}
        </div>
      </div>
      <ProductGrid products={sorted} />
    </section>
  );
}
