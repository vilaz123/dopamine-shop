export type ProductCategory =
  | "beauty"
  | "designer-toys"
  | "clothing"
  | "snacks"
  | "tech"
  | "light-luxury"
  | "food-delivery";

export type DeliveryFlavor = "parcel" | "rider";

export type ProductOptionValue = string | { label: string; priceDelta?: number };

export type ProductOption = {
  label: string;
  values: ProductOptionValue[];
  required?: boolean;
};

export type ProductTag = {
  kind: "sold" | "rank" | "stock" | "deal";
  label: string;
};

export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  currency: "CNY";
  description: string;
  story: string;
  badge: string;
  accent: string;
  saturation: string;
  monogram: string;
  options: ProductOption[];
  relatedSlugs: string[];
  tags: ProductTag[];
  sold: number;
  stock: number;
  rewardCoins: number;
  rewardXp?: number;
  bundleSlugs?: string[];
  giftWrap?: boolean;
  deliveryFlavor?: DeliveryFlavor;
  detailBullets?: string[];
  image?: string;
  detailImages?: string[];
};

export function optionValueLabel(value: ProductOptionValue) {
  return typeof value === "string" ? value : value.label;
}

export function optionValueDelta(value: ProductOptionValue) {
  return typeof value === "string" ? 0 : value.priceDelta ?? 0;
}
