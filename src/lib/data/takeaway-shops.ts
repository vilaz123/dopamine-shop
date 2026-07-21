export type TakeawayCategory =
  | "奶茶咖啡"
  | "炸鸡汉堡"
  | "火锅烧烤"
  | "甜品蛋糕"
  | "夜宵"
  | "轻食沙拉"
  | "零食便利"
  | "虚拟超市"
  | "米其林餐厅";

export type TakeawayCategoryMeta = {
  id: TakeawayCategory | "all";
  label: string;
  emoji: string;
};

export const takeawayCategories: TakeawayCategoryMeta[] = [
  { id: "all", label: "全部外卖", emoji: "🍽️" },
  { id: "米其林餐厅", label: "米其林餐厅", emoji: "👑" },
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
  image?: string;
  detailImages?: string[];
};

/** Build image paths for a shop storefront: a main 4:3 shot plus N detail shots (-2, -3, …). */
function shopMedia(slug: string, detailCount: number) {
  return {
    image: `/shops/${slug}.webp`,
    detailImages: Array.from({ length: detailCount }, (_, i) => `/shops/${slug}-${i + 2}.webp`),
  } as Pick<TakeawayShop, "image" | "detailImages">;
}

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
    ...shopMedia("dopamine-tea-lab", 1),
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
    ...shopMedia("midnight-fried-lab", 1),
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
    ...shopMedia("boiling-fantasy-hotpot", 2),
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
    ...shopMedia("dreamy-cake-studio", 1),
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
    ...shopMedia("midnight-supper-canteen", 2),
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
    ...shopMedia("green-fantasy-salad", 2),
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
    ...shopMedia("forever-convenience", 2),
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
    ...shopMedia("virtual-super-market", 2),
  },
  // ===== 米其林餐厅：还原真实存在的顶级餐厅，细节力求准确 =====
  {
    slug: "kikunoi-akasaka",
    name: "菊乃井 赤坂本店",
    category: "米其林餐厅",
    rating: 5.0,
    monthlySales: 86,
    distanceKm: 9.2,
    deliveryTimeMin: 60,
    deliveryFee: 88,
    minOrder: 2000,
    discounts: ["虚拟满 ¥6000 减 ¥600", "含茶席服务"],
    tags: ["怀石料理", "米其林二星", "东京", "主厨推荐"],
    accent: "#7C2D12",
    saturation: "#9a3412",
    monogram: "菊",
    productSlugs: ["kikunoi-kaiseki-dinner", "kikunoi-kaiseki-lunch", "kikunoi-matsutake-gohan"],
    promo: "本月限定 · 松茸土瓶蒸",
  },
  {
    slug: "sukiyabashi-jiro-ginza",
    name: "数寄屋橋次郎 银座本店",
    category: "米其林餐厅",
    rating: 5.0,
    monthlySales: 41,
    distanceKm: 9.8,
    deliveryTimeMin: 75,
    deliveryFee: 120,
    minOrder: 4000,
    discounts: ["主厨发办 20 贯", "虚拟含小钵逸品"],
    tags: ["寿司", "Omakase", "米其林三星", "东京"],
    accent: "#0F172A",
    saturation: "#1e293b",
    monogram: "鮨",
    productSlugs: ["jiro-omakase-nigiri", "jiro-tuna-otoro"],
    promo: "江户前 · 主厨发办",
  },
  {
    slug: "xia-gong-beijing",
    name: "夏宫 · 中国大饭店",
    category: "米其林餐厅",
    rating: 4.9,
    monthlySales: 312,
    distanceKm: 4.5,
    deliveryTimeMin: 45,
    deliveryFee: 38,
    minOrder: 800,
    discounts: ["满 ¥2000 减 ¥200", "明火烤鸭当日现烤"],
    tags: ["粤菜", "淮扬菜", "北京", "明火烤鸭"],
    accent: "#991B1B",
    saturation: "#b91c1c",
    monogram: "夏",
    productSlugs: ["xiagong-peking-duck", "xiagong-business-set", "xiagong-buddha-jumps-soup"],
    promo: "袁超英师傅 · 155 年明火烤鸭",
  },
  {
    slug: "guy-savoy-paris",
    name: "Guy Savoy · Paris",
    category: "米其林餐厅",
    rating: 5.0,
    monthlySales: 58,
    distanceKm: 12.5,
    deliveryTimeMin: 90,
    deliveryFee: 168,
    minOrder: 3500,
    discounts: ["六道式艺术套餐", "虚拟含餐酒配对建议"],
    tags: ["法餐", "米其林三星", "巴黎", "松露"],
    accent: "#581C87",
    saturation: "#6b21a8",
    monogram: "GS",
    productSlugs: ["guysavoy-art-tasting", "guysavoy-artichoke-truffle"],
    promo: "招牌 · 大理石纹鸡胸鹅肝洋蓟",
  },
  {
    slug: "fuhe-huaishan-zhai",
    name: "福和慧 · 上海",
    category: "米其林餐厅",
    rating: 4.9,
    monthlySales: 174,
    distanceKm: 6.8,
    deliveryTimeMin: 55,
    deliveryFee: 48,
    minOrder: 1200,
    discounts: ["素食怀石 · 时令十品", "满 ¥2000 减 ¥300"],
    tags: ["素食", "怀石", "上海", "米其林一星"],
    accent: "#166534",
    saturation: "#15803d",
    monogram: "福",
    productSlugs: ["fuhe-vegetable-kaiseki", "fuhe-tofu-white-truffle"],
    promo: "时令 · 白松露豆腐",
  },
  {
    slug: "l-ambroisie-paris",
    name: "L'Ambroisie · Place des Vosges",
    category: "米其林餐厅",
    rating: 5.0,
    monthlySales: 33,
    distanceKm: 13.2,
    deliveryTimeMin: 95,
    deliveryFee: 180,
    minOrder: 4500,
    discounts: ["经典法餐三十三年三星", "虚拟含主厨私语卡"],
    tags: ["法餐", "米其林三星", "巴黎", "古典"],
    accent: "#7F1D1D",
    saturation: "#991b1b",
    monogram: "LA",
    productSlugs: ["lambroisie-egg-caviar", "lambroisie-chocolate-souffle"],
    promo: "镇店 · 鱼子酱溏心蛋",
  },
];

export function getTakeawayShop(slug: string): TakeawayShop | null {
  return takeawayShops.find((shop) => shop.slug === slug) ?? null;
}

/** All gallery images for a shop (main first, then details), with empties filtered out. */
export function shopImages(shop: TakeawayShop): string[] {
  return [shop.image, ...(shop.detailImages ?? [])].filter((value): value is string => Boolean(value));
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
