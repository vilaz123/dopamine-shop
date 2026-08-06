import type { Product, ProductCategory } from "@/types/product";

/**
 * 虚拟卡路里映射：产品无 calorie 字段，按 category 给戏谑虚拟值。
 * 不写回 products.ts，单独映射保持产品数据干净。
 * 这些是"投影区"卡路里——落到分身上的虚拟值，不是真实营养。
 */
const byCategory: Record<ProductCategory, number> = {
  "food-delivery": 600,
  snacks: 150,
  beauty: 0,
  "designer-toys": 0,
  clothing: 0,
  tech: 0,
  "light-luxury": 0,
};

/** 个别餐/零食按 slug 微调，让喂食卡路里更有"手感"（值是编的，仅驱动形态）。 */
const bySlug: Record<string, number> = {
  "bubble-tea-mega": 380,
  "morning-coffee-double": 120,
  "midnight-fried-chicken": 780,
  "hotpot-party-set": 1100,
  "midnight-bbq-skewers": 640,
  "dreamy-cake-box": 900,
  "zero-calorie-chips": 5, // 名字就叫零卡，逗一下
};

/** 取一件产品的虚拟卡路里（喂食用）。非食物返回 0。 */
export function virtualCalories(product: Product): number {
  if (product.category !== "food-delivery" && product.category !== "snacks") return 0;
  return bySlug[product.slug] ?? byCategory[product.category] ?? 0;
}

/** 这件产品能否喂分身（食物）。 */
export function isFeedable(product: Product): boolean {
  return product.category === "food-delivery" || product.category === "snacks";
}

/** 这件产品能否给分身穿戴（服饰）。 */
export function isWearable(product: Product): boolean {
  return product.category === "clothing";
}
