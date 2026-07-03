"use client";

import { coupons, calculateDiscount } from "@/lib/data/coupons";

export function CouponPicker({ subtotal, value, onChange }: { subtotal: number; value: string; onChange: (code: string) => void }) {
  const { coupon, discount } = calculateDiscount(subtotal, value);
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white/40 p-4">
      <label className="text-sm font-semibold">虚拟优惠券</label>
      <input value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} placeholder="NEWCOMER / DOPAHUB / NOSPEND" className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none" />
      <div className="mt-3 flex flex-wrap gap-2">
        {coupons.slice(0, 4).map((item) => (
          <button key={item.code} onClick={() => onChange(item.code)} className="rounded-full border border-black/10 px-3 py-1 text-xs hover:border-black/40">{item.code}</button>
        ))}
      </div>
      {coupon && <p className="mt-3 text-sm text-[#8b6b2f]">{coupon.label} · 已抵扣 {discount}</p>}
    </div>
  );
}
