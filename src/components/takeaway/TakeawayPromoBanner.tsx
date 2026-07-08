const promos = [
  { tag: "满减", text: "虚拟满 99 减 30" },
  { tag: "赔付", text: "超时赔付 +20 多巴胺币" },
  { tag: "新人", text: "新人外卖券" },
  { tag: "免运", text: "今日免配送费" },
];

export function TakeawayPromoBanner() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {promos.map((promo) => (
        <div
          key={promo.tag}
          className="flex min-w-[220px] flex-col gap-1 rounded-2xl border border-yellow-400/40 bg-yellow-400/15 p-4"
        >
          <span className="text-xs uppercase tracking-[0.24em] text-[#8b6b2f]">{promo.tag}</span>
          <span className="font-display text-2xl">{promo.text}</span>
        </div>
      ))}
    </div>
  );
}
