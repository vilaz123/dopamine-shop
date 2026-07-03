export type Coupon = {
  code: string;
  label: string;
  kind: "percent" | "fullReduction";
  value: number;
  threshold?: number;
};

export type Badge = {
  id: string;
  name: string;
  icon: string;
  unlockedAt: string;
};

export type AssetState = {
  coins: number;
  xp: number;
  badges: Badge[];
  coupons: Coupon[];
  inventory: Record<string, number>;
  favorites: string[];
  history: string[];
};
