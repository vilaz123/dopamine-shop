"use client";

const filters: Array<[string, string]> = [
  ["default", "综合排序"],
  ["sales", "虚拟月售最高"],
  ["near", "离你最近的幻想店"],
  ["discount", "满减力度最大"],
  ["fast", "最快进入配送中"],
];

export function TakeawayFilterBar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 text-sm sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
      {filters.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`shrink-0 rounded-full border px-3 py-2 backdrop-blur transition sm:px-4 ${active === id ? "border-[var(--gold)] bg-[var(--gold)] text-black" : "border-white/25 bg-white/12 text-white hover:bg-white/20"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
