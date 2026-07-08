"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { takeawayShops } from "@/lib/data/takeaway-shops";
import { withBasePath } from "@/lib/utils/path";
import { TakeawaySearch } from "@/components/takeaway/TakeawaySearch";
import { TakeawayCategoryGrid } from "@/components/takeaway/TakeawayCategoryGrid";
import { TakeawayPromoBanner } from "@/components/takeaway/TakeawayPromoBanner";
import { TakeawayFilterBar } from "@/components/takeaway/TakeawayFilterBar";
import { TakeawayShopCard } from "@/components/takeaway/TakeawayShopCard";
import { TakeawayCartBar } from "@/components/takeaway/TakeawayCartBar";

export default function TakeawayPage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get("category") ?? "all");
    setSort(params.get("sort") ?? "default");
  }, []);

  function updateQuery(nextCategory = category, nextSort = sort) {
    setCategory(nextCategory);
    setSort(nextSort);
    const params = new URLSearchParams({ category: nextCategory, sort: nextSort });
    window.history.replaceState(null, "", withBasePath(`/takeaway/?${params.toString()}`));
  }

  const list = useMemo(() => {
    const filtered = takeawayShops.filter((shop) => {
      if (category !== "all" && shop.category !== category) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return shop.name.toLowerCase().includes(q) || shop.tags.some((tag) => tag.toLowerCase().includes(q));
      }
      return true;
    });
    const sorted = [...filtered];
    if (sort === "sales") sorted.sort((a, b) => b.monthlySales - a.monthlySales);
    else if (sort === "near") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sort === "discount") sorted.sort((a, b) => b.discounts.length - a.discounts.length);
    else if (sort === "fast") sorted.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin);
    return sorted;
  }, [category, sort, query]);

  return (
    <section className="container-shell py-12">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">Dopahub Takeaway</p>
        <h1 className="font-display mt-4 text-6xl">虚拟外卖</h1>
        <p className="mt-5 text-lg leading-8 text-[#7a7167]">复刻真实外卖信息流：分类、满减、骑手、配送进度都在，但所有餐品都不会真正送到，热量也永远不落地。</p>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-[2rem] border border-black/10 bg-[#fffaf2] p-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm text-[#554c43]">
            <MapPin size={16} /> 当前位置：<span className="font-semibold text-black">幻想街区 · 永不签收门牌 8 号</span>
          </span>
          <span className="flex items-center gap-2 text-sm text-[#554c43]">
            <Clock size={16} /> 预计送达：<span className="font-semibold text-black">永远配送中</span>
          </span>
        </div>
        <Link href="/profile" className="inline-flex w-fit items-center justify-center rounded-full border border-black/15 px-5 py-3 text-sm font-semibold transition hover:border-black/40">更改虚拟地址</Link>
      </div>

      <div className="mb-6">
        <TakeawaySearch value={query} onChange={setQuery} />
      </div>

      <div className="mb-6">
        <TakeawayCategoryGrid active={category} onSelect={(id) => updateQuery(id, sort)} />
      </div>

      <div className="mb-8">
        <TakeawayPromoBanner />
      </div>

      <div className="mb-8">
        <TakeawayFilterBar active={sort} onSelect={(id) => updateQuery(category, id)} />
      </div>

      <div className="space-y-6">
        {list.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-black/15 bg-[#fffaf2] p-12 text-center text-[#7a7167]">
            没有符合幻想条件的店铺，换个分类或搜索词试试。
          </div>
        ) : (
          list.map((shop) => <TakeawayShopCard key={shop.slug} shop={shop} />)
        )}
      </div>

      <TakeawayCartBar />
    </section>
  );
}
