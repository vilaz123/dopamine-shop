"use client";

import { takeawayCategories } from "@/lib/data/takeaway-shops";

export function TakeawayCategoryGrid({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
      {takeawayCategories.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 transition ${active === item.id ? "border-black bg-black text-[var(--bone)]" : "border-black/10 bg-white hover:border-black/30"}`}
        >
          <span className="text-2xl">{item.emoji}</span>
          <span className="text-xs font-semibold">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
