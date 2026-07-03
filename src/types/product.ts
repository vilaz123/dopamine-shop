export type ProductCategory =
  | "beauty"
  | "designer-toys"
  | "clothing"
  | "snacks"
  | "tech"
  | "light-luxury"
  | "food-delivery";

export type DeliveryFlavor = "parcel" | "rider";

export type ProductOption = {
  label: string;
  values: string[];
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
  bundleSlugs?: string[];
  giftWrap?: boolean;
  deliveryFlavor?: DeliveryFlavor;
};
