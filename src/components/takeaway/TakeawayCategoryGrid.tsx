"use client";

import { takeawayCategories } from "@/lib/data/takeaway-shops";

export function TakeawayCategoryGrid({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-9">
      {takeawayCategories.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`flex flex-col items-center gap-1.5 rounded-2xl border px-1.5 py-3 backdrop-blur transition sm:px-2 sm:py-4 sm:gap-2 ${active === item.id ? "border-[var(--gold)] bg-[var(--gold)] text-black" : "border-white/25 bg-white/12 text-white hover:bg-white/20"}`}
        >
          <span className="text-xl sm:text-2xl">{item.emoji}</span>
          <span className="line-clamp-1 text-[11px] font-semibold sm:text-xs">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
