export type TakeawayCategory =
  | "奶茶咖啡"
  | "炸鸡汉堡"
  | "火锅烧烤"
  | "甜品蛋糕"
  | "夜宵"
  | "轻食沙拉"
  | "零食便利"
  | "虚拟超市";

export type TakeawayCategoryMeta = {
  id: TakeawayCategory | "all";
  label: string;
  emoji: string;
};

export const takeawayCategories: TakeawayCategoryMeta[] = [
  { id: "all", label: "全部外卖", emoji: "🍽️" },
  { id: "奶茶咖啡", label: "奶茶咖啡", emoji: "🍵" },
  { id: "炸鸡汉堡", label: "炸鸡汉堡", emoji: "🍔" },
  { id: "火锅烧烤", label: "火锅烧烤", emoji: "🍲" },
  { id: "甜品蛋糕", label: "甜品蛋糕", emoji: "🍰" },
  { id: "夜宵", label: "夜宵", emoji: "🌙" },
  { id: "轻食沙拉", label: "轻食沙拉", emoji: "🥗" },
  { id: "零食便利", label: "零食便利", emoji: "🏪" },
  { id: "虚拟超市", label: "虚拟超市", emoji: "🛒" },
];

export type TakeawayShop = {
  slug: string;
  name: string;
  category: TakeawayCategory;
  rating: number;
  monthlySales: number;
  distanceKm: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrder: number;
  discounts: string[];
  tags: string[];
  accent: string;
  saturation: string;
  monogram: string;
  productSlugs: string[];
  promo?: string;
};

export const takeawayShops: TakeawayShop[] = [
  {
    slug: "dopamine-tea-lab",
    name: "多巴胺茶饮所",
    category: "奶茶咖啡",
    rating: 4.8,
    monthlySales: 9801,
    distanceKm: 0.6,
    deliveryTimeMin: 18,
    deliveryFee: 0,
    minOrder: 20,
    discounts: ["满¥40减¥8", "新人免配送费"],
    tags: ["奶茶", "咖啡", "人气"],
    accent: "#F43F5E",
    saturation: "#fb7185",
    monogram: "DT",
    productSlugs: ["bubble-tea-mega", "morning-coffee-double"],
    promo: "今日免配送费",
  },
  {
    slug: "midnight-fried-lab",
    name: "深夜炸鸡研究所",
    category: "炸鸡汉堡",
    rating: 4.9,
    monthlySales: 12000,
    distanceKm: 0.8,
    deliveryTimeMin: 20,
    deliveryFee: 0,
    minOrder: 0,
    discounts: ["满¥99减¥30", "超时赔付+20多巴胺币"],
    tags: ["炸鸡", "汉堡", "夜宵"],
    accent: "#EF4444",
    saturation: "#ef4444",
    monogram: "FL",
    productSlugs: ["midnight-fried-chicken"],
    promo: "超时赔付 +20 多巴胺币",
  },
  {
    slug: "boiling-fantasy-hotpot",
    name: "沸腾幻想火锅局",
    category: "火锅烧烤",
    rating: 4.7,
    monthlySales: 4567,
    distanceKm: 1.2,
    deliveryTimeMin: 25,
    deliveryFee: 6,
    minOrder: 80,
    discounts: ["满¥200减¥40", "锅底免费"],
    tags: ["火锅", "烧烤", "聚餐"],
    accent: "#DC2626",
    saturation: "#dc2626",
    monogram: "BF",
    productSlugs: ["hotpot-party-set", "midnight-bbq-skewers"],
    promo: "满¥200减¥40",
  },
  {
    slug: "dreamy-cake-studio",
    name: "造梦甜品工坊",
    category: "甜品蛋糕",
    rating: 4.8,
    monthlySales: 5400,
    distanceKm: 1.0,
    deliveryTimeMin: 22,
    deliveryFee: 5,
    minOrder: 30,
    discounts: ["满¥99减¥20", "生日蜡烛+1"],
    tags: ["甜品", "蛋糕", "仪式感"],
    accent: "#DB2777",
    saturation: "#db2777",
    monogram: "DS",
    productSlugs: ["dreamy-cake-box"],
    promo: "新人外卖券",
  },
  {
    slug: "midnight-supper-canteen",
    name: "零点夜宵食堂",
    category: "夜宵",
    rating: 4.6,
    monthlySales: 6800,
    distanceKm: 0.9,
    deliveryTimeMin: 23,
    deliveryFee: 4,
    minOrder: 25,
    discounts: ["满¥88减¥18", "深夜不打烊"],
    tags: ["夜宵", "卤味", "小食"],
    accent: "#7C3AED",
    saturation: "#7c3aed",
    monogram: "MS",
    productSlugs: ["night-supper-platter"],
    promo: "深夜不打烊",
  },
  {
    slug: "green-fantasy-salad",
    name: "绿色幻想轻食",
    category: "轻食沙拉",
    rating: 4.5,
    monthlySales: 4100,
    distanceKm: 1.4,
    deliveryTimeMin: 19,
    deliveryFee: 3,
    minOrder: 20,
    discounts: ["满¥48减¥6", "零卡幻觉"],
    tags: ["轻食", "沙拉", "自律"],
    accent: "#16A34A",
    saturation: "#22c55e",
    monogram: "GF",
    productSlugs: ["green-salad-bowl"],
    promo: "今日免配送费",
  },
  {
    slug: "forever-convenience",
    name: "永远便利店",
    category: "零食便利",
    rating: 4.7,
    monthlySales: 8900,
    distanceKm: 0.4,
    deliveryTimeMin: 15,
    deliveryFee: 0,
    minOrder: 0,
    discounts: ["满¥39减¥5", "盲选加一袋"],
    tags: ["便利", "零食", "盲选"],
    accent: "#0891B2",
    saturation: "#06b6d4",
    monogram: "FC",
    productSlugs: ["convenience-mystery-bag"],
    promo: "满¥39减¥5",
  },
  {
    slug: "virtual-super-market",
    name: "虚拟超市仓库",
    category: "虚拟超市",
    rating: 4.6,
    monthlySales: 5300,
    distanceKm: 2.0,
    deliveryTimeMin: 30,
    deliveryFee: 8,
    minOrder: 99,
    discounts: ["满¥168减¥30", "囤货满返"],
    tags: ["超市", "囤货", "生鲜"],
    accent: "#0EA5E9",
    saturation: "#0ea5e9",
    monogram: "VS",
    productSlugs: ["virtual-super-market-box"],
    promo: "今日免配送费",
  },
];

export function getTakeawayShop(slug: string): TakeawayShop | null {
  return takeawayShops.find((shop) => shop.slug === slug) ?? null;
}

export function getShopByProductSlug(productSlug: string): TakeawayShop | null {
  return takeawayShops.find((shop) => shop.productSlugs.includes(productSlug)) ?? null;
}

export function formatMonthlySales(n: number): string {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万+` : `${n}+`;
}

export function cartItemHref(productSlug: string, flavor?: string): string {
  if (flavor === "rider") {
    const shop = getShopByProductSlug(productSlug);
    if (shop) return `/takeaway/${shop.slug}`;
  }
  return `/shop/${productSlug}`;
}
