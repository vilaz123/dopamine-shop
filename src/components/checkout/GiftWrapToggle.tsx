"use client";

export function GiftWrapToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`w-full rounded-[1.5rem] border p-4 text-left transition ${checked ? "border-black bg-black text-[#f6f1e8]" : "border-black/10 bg-white/40"}`}>
      <p className="font-semibold">虚拟礼品包装</p>
      <p className="mt-1 text-sm opacity-70">+¥9 虚拟包装费，增加仪式感与 +5 多巴胺币。</p>
    </button>
  );
}
