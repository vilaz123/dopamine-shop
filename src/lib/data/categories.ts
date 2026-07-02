import type { ProductCategory } from "@/types/product";

export const categories: Array<{ id: "all" | ProductCategory; label: string; description: string }> = [
  { id: "all", label: "全部藏品", description: "所有只存在于想象里的购买欲。" },
  { id: "fragrance", label: "高级香氛", description: "闻不到，但足够让钱包安静。" },
  { id: "tech", label: "冷感数码", description: "你想升级的不是设备，是此刻的心情。" },
  { id: "home", label: "家居器物", description: "为理想生活下单，不占据真实空间。" },
  { id: "fashion", label: "衣橱幻象", description: "穿搭灵感已拥有，快递可以缺席。" },
];
