export type Bundle = {
  id: string;
  label: string;
  memberSlugs: string[];
  rewardCoins: number;
};

export const bundles: Bundle[] = [
  { id: "beauty-glow", label: "美妆发光凑单组", memberSlugs: ["glow-lip-kit", "cloud-cushion-foundation", "noir-velvet-fragrance"], rewardCoins: 40 },
  { id: "desk-setup", label: "数码桌面满足组", memberSlugs: ["mist-headphones-pro", "midnight-keyboard-max"], rewardCoins: 35 },
  { id: "snack-haul", label: "零食囤货快乐组", memberSlugs: ["rainbow-snack-crate", "zero-calorie-chips"], rewardCoins: 30 },
  { id: "delivery-night", label: "深夜外卖快乐组", memberSlugs: ["midnight-fried-chicken", "bubble-tea-mega", "hotpot-party-set"], rewardCoins: 50 },
];

export function findRelevantBundles(slugs: string[]) {
  return bundles.filter((bundle) => bundle.memberSlugs.some((slug) => slugs.includes(slug)));
}
