// 盲盒系列数据：致敬泡泡玛特等潮玩盲盒，风格化命名 + 稀有度 + 概率。
// 用于"开盒"随机抽取体验。每个系列含若干款式，按稀有度概率分布。
// 命名为致敬风（Mochi/Mochi 星球 等），不直接使用真实 IP 名。

export type BlindRarity = "common" | "rare" | "super-rare" | "hidden";

export type BlindFigure = {
  id: string;
  name: string;
  rarity: BlindRarity;
  emoji: string;
  accent: string;
};

export type BlindSeries = {
  slug: string;
  name: string;
  subtitle: string;
  brand: string; // 致敬说明
  price: number;
  accent: string;
  saturation: string;
  monogram: string;
  story: string;
  figures: BlindFigure[];
};

export const rarityMeta: Record<BlindRarity, { label: string; rate: number; color: string }> = {
  common: { label: "常规款", rate: 0.78, color: "#94a3b8" },
  rare: { label: "稀有款", rate: 0.15, color: "#3b82f6" },
  "super-rare": { label: "超稀有", rate: 0.05, color: "#a855f7" },
  hidden: { label: "隐藏款", rate: 0.02, color: "#f59e0b" },
};

export const blindSeries: BlindSeries[] = [
  {
    slug: "mochi-planet-series",
    name: "Mochi 星球 · 宇宙漫游系列",
    subtitle: "致敬潮玩盲盒 · 12 款 + 1 隐藏",
    brand: "致敬泡泡玛特 Molly/Dimoo 风格",
    price: 69,
    accent: "#FF8A00",
    saturation: "#fb923c",
    monogram: "MP",
    story: "Mochi 是来自 M76 星云的小精灵，每只都有不同的星球记忆。一盒一只，隐藏款「星尘 Mochi」概率 2%，开出即传说。虚拟开盒：重复款焦虑删除，开盒快感 100%。",
    figures: [
      { id: "m1", name: "月光 Mochi", rarity: "common", emoji: "🌙", accent: "#60a5fa" },
      { id: "m2", name: "云朵 Mochi", rarity: "common", emoji: "☁️", accent: "#e0e7ff" },
      { id: "m3", name: "草莓 Mochi", rarity: "common", emoji: "🍓", accent: "#fb7185" },
      { id: "m4", name: "薄荷 Mochi", rarity: "common", emoji: "🍃", accent: "#34d399" },
      { id: "m5", name: "蜜桃 Mochi", rarity: "common", emoji: "🍑", accent: "#fbbf24" },
      { id: "m6", name: "海洋 Mochi", rarity: "common", emoji: "🌊", accent: "#22d3ee" },
      { id: "m7", name: "樱花 Mochi", rarity: "rare", emoji: "🌸", accent: "#f472b6" },
      { id: "m8", name: "极光 Mochi", rarity: "rare", emoji: "🌠", accent: "#a78bfa" },
      { id: "m9", name: "银河 Mochi", rarity: "rare", emoji: "🌌", accent: "#818cf8" },
      { id: "m10", name: "熔岩 Mochi", rarity: "super-rare", emoji: "🌋", accent: "#f97316" },
      { id: "m11", name: "水晶 Mochi", rarity: "super-rare", emoji: "💎", accent: "#67e8f9" },
      { id: "m12", name: "彩虹 Mochi", rarity: "super-rare", emoji: "🌈", accent: "#c084fc" },
      { id: "m13", name: "星尘 Mochi", rarity: "hidden", emoji: "✨", accent: "#fbbf24" },
    ],
  },
  {
    slug: "skull-candy-series",
    name: "糖骷 · 甜美骷髅系列",
    subtitle: "致敬潮玩盲盒 · 10 款 + 1 隐藏",
    brand: "致敬 Skullpanda 风格",
    price: 79,
    accent: "#7C3AED",
    saturation: "#a855f7",
    monogram: "SC",
    story: "糖骷是一群住在糖果墓园的小骷髅，每只都有甜美与暗黑的双重性格。隐藏款「黑糖骷髅王」概率 2%。虚拟开盒：暗黑甜美的反差萌，开盒即拥有。",
    figures: [
      { id: "s1", name: "棉花糖骷", rarity: "common", emoji: "🍭", accent: "#f472b6" },
      { id: "s2", name: "巧克力骷", rarity: "common", emoji: "🍫", accent: "#92400e" },
      { id: "s3", name: "薄荷糖骷", rarity: "common", emoji: "🍬", accent: "#34d399" },
      { id: "s4", name: "焦糖骷", rarity: "common", emoji: "🍯", accent: "#fbbf24" },
      { id: "s5", name: "蓝莓骷", rarity: "common", emoji: "🫐", accent: "#6366f1" },
      { id: "s6", name: "草莓骷", rarity: "common", emoji: "🍓", accent: "#fb7185" },
      { id: "s7", name: "玫瑰金骷", rarity: "rare", emoji: "🌹", accent: "#f59e0b" },
      { id: "s8", name: "紫水晶骷", rarity: "rare", emoji: "🔮", accent: "#a855f7" },
      { id: "s9", name: "冰雪骷", rarity: "super-rare", emoji: "❄️", accent: "#67e8f9" },
      { id: "s10", name: "火焰骷", rarity: "super-rare", emoji: "🔥", accent: "#f97316" },
      { id: "s11", name: "黑糖骷髅王", rarity: "hidden", emoji: "👑", accent: "#1f2937" },
    ],
  },
  {
    slug: "dimoo-dream-series",
    name: "Dimuu · 梦境漫游系列",
    subtitle: "致敬潮玩盲盒 · 12 款 + 1 隐藏",
    brand: "致敬 Dimoo 风格",
    price: 69,
    accent: "#06B6D4",
    saturation: "#22d3ee",
    monogram: "DM",
    story: "Dimuu 是一个总在做梦的小男孩，每只都定格在一个不同的梦境。隐藏款「造梦主」概率 2%。虚拟开盒：梦是免费的，开盒也是。",
    figures: [
      { id: "d1", name: "飞行梦", rarity: "common", emoji: "🪁", accent: "#60a5fa" },
      { id: "d2", name: "潜水梦", rarity: "common", emoji: "🐠", accent: "#22d3ee" },
      { id: "d3", name: "森林梦", rarity: "common", emoji: "🌲", accent: "#34d399" },
      { id: "d4", name: "星空梦", rarity: "common", emoji: "⭐", accent: "#818cf8" },
      { id: "d5", name: "花田梦", rarity: "common", emoji: "🌷", accent: "#f472b6" },
      { id: "d6", name: "雪国梦", rarity: "common", emoji: "⛄", accent: "#e0e7ff" },
      { id: "d7", name: "糖果梦", rarity: "rare", emoji: "🍡", accent: "#fb7185" },
      { id: "d8", name: "机械梦", rarity: "rare", emoji: "🤖", accent: "#64748b" },
      { id: "d9", name: "海洋梦", rarity: "rare", emoji: "🐋", accent: "#0ea5e9" },
      { id: "d10", name: "凤凰梦", rarity: "super-rare", emoji: "🦅", accent: "#f59e0b" },
      { id: "d11", name: "独角兽梦", rarity: "super-rare", emoji: "🦄", accent: "#c084fc" },
      { id: "d12", name: "龙之梦", rarity: "super-rare", emoji: "🐉", accent: "#10b981" },
      { id: "d13", name: "造梦主", rarity: "hidden", emoji: "🌠", accent: "#fbbf24" },
    ],
  },
];

export function getBlindSeries(slug: string): BlindSeries | null {
  return blindSeries.find((s) => s.slug === slug) ?? null;
}

/** 按稀有度概率随机抽一个款式。 */
export function drawRandomFigure(series: BlindSeries): BlindFigure {
  const r = Math.random();
  let acc = 0;
  const order: BlindRarity[] = ["hidden", "super-rare", "rare", "common"];
  for (const rarity of order) {
    acc += rarityMeta[rarity].rate;
    if (r <= acc) {
      const pool = series.figures.filter((f) => f.rarity === rarity);
      if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return series.figures[0];
}
