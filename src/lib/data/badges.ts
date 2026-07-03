import type { AssetState, Badge } from "@/types/asset";

export const badgeCatalog = [
  { id: "first-order", name: "首单多巴胺", icon: "✦" },
  { id: "foodie", name: "外卖幻觉家", icon: "◌" },
  { id: "collector", name: "虚拟囤货王", icon: "◆" },
  { id: "luxury", name: "轻奢无痛党", icon: "◇" },
  { id: "coin-rush", name: "金币收割机", icon: "◎" },
];

export function evaluateBadges(asset: AssetState, context: { hasFood?: boolean; hasLuxury?: boolean }) {
  const owned = new Set(asset.badges.map((badge) => badge.id));
  const next: Badge[] = [];
  function unlock(id: string) {
    if (owned.has(id)) return;
    const template = badgeCatalog.find((badge) => badge.id === id);
    if (!template) return;
    next.push({ ...template, unlockedAt: new Date().toISOString() });
  }
  unlock("first-order");
  if (context.hasFood) unlock("foodie");
  if (context.hasLuxury) unlock("luxury");
  if (Object.keys(asset.inventory).length >= 5) unlock("collector");
  if (asset.coins >= 500) unlock("coin-rush");
  return next;
}
