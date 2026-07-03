import type { Coupon } from "@/types/asset";

export const coupons: Coupon[] = [
  { code: "NEWCOMER", label: "新人无痛满减券：满 ¥599 减 ¥80", kind: "fullReduction", value: 80, threshold: 599 },
  { code: "DOPAHUB", label: "多巴胺仓会员券：全场 88 折", kind: "percent", value: 0.12 },
  { code: "NOSPEND", label: "不花钱纪念券：全场 76 折", kind: "percent", value: 0.24 },
  { code: "COMBO50", label: "虚拟凑单券：满 ¥999 减 ¥120", kind: "fullReduction", value: 120, threshold: 999 },
  { code: "FEAST", label: "外卖专区券：满 ¥99 减 ¥30", kind: "fullReduction", value: 30, threshold: 99 },
];

export function findCoupon(code?: string) {
  if (!code) return null;
  return coupons.find((coupon) => coupon.code === code.trim().toUpperCase()) ?? null;
}

export function calculateDiscount(subtotal: number, code?: string) {
  const coupon = findCoupon(code);
  if (!coupon) return { coupon: null, discount: 0 };
  if (coupon.kind === "fullReduction" && coupon.threshold && subtotal < coupon.threshold) {
    return { coupon, discount: 0 };
  }
  const discount = coupon.kind === "percent" ? Math.round(subtotal * coupon.value) : coupon.value;
  return { coupon, discount: Math.min(discount, subtotal) };
}
