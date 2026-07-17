"use client";

import { coupons, calculateDiscount } from "@/lib/data/coupons";
import { useAssetStore } from "@/stores/asset-store";

export function CouponPicker({ subtotal, value, onChange }: { subtotal: number; value: string; onChange: (code: string) => void }) {
  const { coupon, discount } = calculateDiscount(subtotal, value);
  const ownedCoupons = useAssetStore((state) => state.coupons);
  const ownedCodes = ownedCoupons.map((item) => item.code);
  const presets = [...new Set([...ownedCodes, ...coupons.slice(0, 4).map((item) => item.code)])];
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white/40 p-4">
      <label className="text-sm font-semibold">虚拟优惠券</label>
      <input value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} placeholder="NEWCOMER / DOPAHUB / FEAST / TAKEAWAYNEW" className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none" />
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((code) => (
          <button key={code} onClick={() => onChange(code)} className={`rounded-full border px-3 py-1 text-xs transition ${value === code ? "border-black bg-black text-[var(--bone)]" : "border-black/10 hover:border-black/40"}`}>{code}</button>
        ))}
      </div>
      {coupon && <p className="mt-3 text-sm text-[var(--hot)]">{coupon.label} · 已抵扣 {discount}</p>}
    </div>
  );
}
