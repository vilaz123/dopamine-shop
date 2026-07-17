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
    <div className="flex flex-wrap gap-3 text-sm">
      {filters.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`rounded-full border px-4 py-2 transition ${active === id ? "border-black bg-black text-[var(--bone)]" : "border-black/10 bg-white hover:border-black/30"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
