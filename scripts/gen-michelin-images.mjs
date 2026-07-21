// 为米其林餐厅与菜品生成风格化插画占位图（webp）。
// 因为 sharp 渲染 SVG 不支持彩色 emoji，用几何抽象：渐变背景 + 盘 + 食物色块 + 文字。
// 设计统一：极简美食海报风，按菜品类型选食物色组。
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 1000;
const H = 1250; // 4:5 菜品
const WH = 1000;
const HH = 750; // 4:3 餐厅门面

// 每个条目：slug, kind, brand, name, accent, sat, foods(食物色块)
// kind 决定盘型与食物排布；foods 是 2–4 个 {c,x,y,r} 抽象食物圆/块
const items = [
  { slug: "kikunoi-kaiseki-dinner", brand: "菊乃井", name: "晚怀石十一品", accent: "#7C2D12", sat: "#9a3412", kind: "kaiseki" },
  { slug: "kikunoi-kaiseki-lunch", brand: "菊乃井", name: "午怀石便当", accent: "#92400E", sat: "#b45309", kind: "kaiseki" },
  { slug: "kikunoi-matsutake-gohan", brand: "菊乃井", name: "松茸土瓶蒸", accent: "#9A3412", sat: "#c2410c", kind: "kaiseki" },
  { slug: "jiro-omakase-nigiri", brand: "数寄屋橋次郎", name: "主厨发办 20 贯", accent: "#0F172A", sat: "#1e293b", kind: "sushi" },
  { slug: "jiro-tuna-otoro", brand: "数寄屋橋次郎", name: "本鲔大トロ", accent: "#1E293B", sat: "#334155", kind: "sushi" },
  { slug: "xiagong-peking-duck", brand: "夏宫", name: "明火烤鸭", accent: "#991B1B", sat: "#b91c1c", kind: "duck" },
  { slug: "xiagong-business-set", brand: "夏宫", name: "商务宴请套餐", accent: "#7F1D1D", sat: "#991b1b", kind: "duck" },
  { slug: "xiagong-buddha-jumps-soup", brand: "夏宫", name: "佛跳墙", accent: "#B45309", sat: "#d97706", kind: "kaiseki" },
  { slug: "guysavoy-art-tasting", brand: "Guy Savoy", name: "六道式艺术套餐", accent: "#581C87", sat: "#6b21a8", kind: "french" },
  { slug: "guysavoy-artichoke-truffle", brand: "Guy Savoy", name: "大理石纹洋蓟", accent: "#6B21A8", sat: "#7c3aed", kind: "french" },
  { slug: "fuhe-vegetable-kaiseki", brand: "福和慧", name: "素食怀石十品", accent: "#166534", sat: "#15803d", kind: "vegan" },
  { slug: "fuhe-tofu-white-truffle", brand: "福和慧", name: "白松露豆腐", accent: "#15803D", sat: "#16a34a", kind: "vegan" },
  { slug: "lambroisie-egg-caviar", brand: "L'Ambroisie", name: "鱼子酱溏心蛋", accent: "#7F1D1D", sat: "#991b1b", kind: "egg" },
  { slug: "lambroisie-chocolate-souffle", brand: "L'Ambroisie", name: "巧克力舒芙蕾", accent: "#451A03", sat: "#78350f", kind: "dessert" },
  { slug: "davittorio-tagliolini-truffle", brand: "Da Vittorio", name: "白松露 Tagliolini", accent: "#B45309", sat: "#d97706", kind: "pasta" },
  { slug: "davittorio-paccheri-seafood", brand: "Da Vittorio", name: "海鲜 Paccheri", accent: "#92400E", sat: "#b45309", kind: "pasta" },
  { slug: "ukai-ohmi-gyu-teppan", brand: "うかい亭", name: "A5 近江牛铁板烧", accent: "#7F1D1D", sat: "#991b1b", kind: "beef" },
  { slug: "ukai-aba-lion-course", brand: "うかい亭", name: "主厨铁板烧套餐", accent: "#991B1B", sat: "#b91c1c", kind: "beef" },
  { slug: "macallan-vintage-flight", brand: "Macallan", name: "年份垂直品鉴", accent: "#78350F", sat: "#92400e", kind: "whisky" },
  { slug: "macallan-rare-cask-pour", brand: "Macallan", name: "Rare Cask 单杯", accent: "#92400E", sat: "#a16207", kind: "whisky" },
  { slug: "macallan-whisky-pairing-set", brand: "Macallan", name: "威士忌佐餐三式", accent: "#A16207", sat: "#b45309", kind: "whisky" },
];

// 按 kind 生成盘子里的抽象食物色块（坐标相对 0–1，中心 0.5,0.5）
function foodsFor(kind) {
  const cx = 0.5;
  const cy = 0.52;
  switch (kind) {
    case "sushi":
      return [
        { c: "#fef3c7", x: cx - 0.12, y: cy, r: 0.07 },
        { c: "#ef4444", x: cx - 0.12, y: cy - 0.03, r: 0.04 },
        { c: "#fef3c7", x: cx, y: cy, r: 0.07 },
        { c: "#f97316", x: cx, y: cy - 0.03, r: 0.04 },
        { c: "#fef3c7", x: cx + 0.12, y: cy, r: 0.07 },
        { c: "#dc2626", x: cx + 0.12, y: cy - 0.03, r: 0.045 },
      ];
    case "kaiseki":
      return [
        { c: "#86efac", x: cx - 0.1, y: cy - 0.05, r: 0.05 },
        { c: "#fca5a5", x: cx + 0.08, y: cy - 0.08, r: 0.055 },
        { c: "#fde68a", x: cx - 0.02, y: cy + 0.08, r: 0.05 },
        { c: "#fbcfe8", x: cx + 0.1, y: cy + 0.06, r: 0.04 },
      ];
    case "duck":
      return [
        { c: "#b45309", x: cx - 0.06, y: cy, r: 0.11 },
        { c: "#7c2d12", x: cx + 0.08, y: cy, r: 0.09 },
        { c: "#fbbf24", x: cx - 0.04, y: cy - 0.1, r: 0.035 },
      ];
    case "french":
      return [
        { c: "#c4b5fd", x: cx - 0.08, y: cy - 0.04, r: 0.06 },
        { c: "#fbbf24", x: cx + 0.09, y: cy + 0.02, r: 0.05 },
        { c: "#fde68a", x: cx, y: cy + 0.1, r: 0.045 },
      ];
    case "vegan":
      return [
        { c: "#bbf7d0", x: cx - 0.09, y: cy, r: 0.06 },
        { c: "#fef9c3", x: cx + 0.08, y: cy - 0.06, r: 0.055 },
        { c: "#86efac", x: cx + 0.04, y: cy + 0.1, r: 0.04 },
      ];
    case "egg":
      return [
        { c: "#fef3c7", x: cx, y: cy + 0.02, r: 0.13 },
        { c: "#1c1917", x: cx - 0.02, y: cy - 0.06, r: 0.05 },
        { c: "#0a0a0a", x: cx + 0.05, y: cy - 0.08, r: 0.03 },
      ];
    case "dessert":
      return [
        { c: "#7c2d12", x: cx, y: cy + 0.05, r: 0.13 },
        { c: "#92400e", x: cx, y: cy - 0.02, r: 0.1 },
        { c: "#fafaf9", x: cx + 0.12, y: cy + 0.1, r: 0.04 },
      ];
    case "pasta":
      return [
        { c: "#fde68a", x: cx - 0.05, y: cy, r: 0.1 },
        { c: "#f59e0b", x: cx + 0.08, y: cy - 0.05, r: 0.05 },
        { c: "#fef3c7", x: cx + 0.06, y: cy + 0.08, r: 0.045 },
      ];
    case "beef":
      return [
        { c: "#7f1d1d", x: cx - 0.04, y: cy, r: 0.12 },
        { c: "#991b1b", x: cx + 0.1, y: cy - 0.04, r: 0.08 },
        { c: "#fbbf24", x: cx - 0.12, y: cy + 0.12, r: 0.035 },
        { c: "#16a34a", x: cx + 0.14, y: cy + 0.12, r: 0.03 },
      ];
    case "whisky":
      return [
        { c: "#f59e0b", x: cx, y: cy + 0.04, r: 0.07 },
        { c: "#b45309", x: cx, y: cy - 0.02, r: 0.05 },
        { c: "#fde68a", x: cx + 0.13, y: cy + 0.04, r: 0.045 },
        { c: "#fbbf24", x: cx - 0.13, y: cy + 0.04, r: 0.045 },
      ];
  }
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 生成一张菜品图：variant 用于 detail 图（1=主，2/3=细节变体，变换食物位置/盘型）
function buildSvg(item, variant, w, h) {
  const foods = foodsFor(item.kind);
  const plateR = w * 0.3;
  const cx = w / 2;
  const cy = h * (variant === 1 ? 0.5 : 0.48);
  const foodEls = foods
    .map((f) => {
      const fx = cx + (f.x - 0.5) * w * 0.7 + (variant - 1) * 8;
      const fy = cy + (f.y - 0.5) * h * 0.7;
      const fr = f.r * w * 0.8;
      return `<circle cx="${fx.toFixed(0)}" cy="${fy.toFixed(0)}" r="${fr.toFixed(0)}" fill="${f.c}" opacity="0.95"/>`;
    })
    .join("");
  const dish = variant % 2 === 1
    ? `<circle cx="${cx}" cy="${cy}" r="${plateR}" fill="#ffffff" opacity="0.92"/>
       <circle cx="${cx}" cy="${cy}" r="${plateR * 0.78}" fill="none" stroke="${item.accent}" stroke-opacity="0.15" stroke-width="3"/>`
    : `<rect x="${cx - plateR}" y="${cy - plateR * 0.62}" width="${plateR * 2}" height="${plateR * 1.24}" rx="20" fill="#ffffff" opacity="0.92"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="bg" cx="30%" cy="25%" r="90%">
      <stop offset="0%" stop-color="${item.sat}"/>
      <stop offset="100%" stop-color="${item.accent}"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w * 0.82}" cy="${h * 0.18}" r="${w * 0.22}" fill="#ffffff" opacity="0.08"/>
  <circle cx="${w * 0.12}" cy="${h * 0.85}" r="${w * 0.18}" fill="#000000" opacity="0.1"/>
  ${dish}
  ${foodEls}
  <text x="${w / 2}" y="${h * 0.13}" text-anchor="middle" font-family="Georgia, 'PingFang SC', serif" font-size="${w * 0.034}" fill="#ffffff" opacity="0.85" letter-spacing="3">${esc(item.brand.toUpperCase())}</text>
  <text x="${w / 2}" y="${h * 0.88}" text-anchor="middle" font-family="'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="${w * 0.062}" font-weight="700" fill="#ffffff">${esc(item.name)}</text>
  <text x="${w / 2}" y="${h * 0.94}" text-anchor="middle" font-family="Georgia, serif" font-size="${w * 0.022}" fill="#ffffff" opacity="0.6" letter-spacing="4">DOPAHUB · MICHELIN</text>
</svg>`;
}

mkdirSync("public/products", { recursive: true });
mkdirSync("public/shops", { recursive: true });

// 菜品图：main + 2 detail
for (const item of items) {
  for (let v = 1; v <= 3; v++) {
    const svg = buildSvg(item, v, W, H);
    const name = v === 1 ? `${item.slug}.webp` : `${item.slug}-${v}.webp`;
    await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(`public/products/${name}`);
  }
}

// 餐厅门面图：每个餐厅一张 4:3（用其代表菜品风格）
const shopMap = {
  "kikunoi-akasaka": { brand: "菊乃井", accent: "#7C2D12", sat: "#9a3412", kind: "kaiseki" },
  "sukiyabashi-jiro-ginza": { brand: "数寄屋橋次郎", accent: "#0F172A", sat: "#1e293b", kind: "sushi" },
  "xia-gong-beijing": { brand: "夏宫", accent: "#991B1B", sat: "#b91c1c", kind: "duck" },
  "guy-savoy-paris": { brand: "Guy Savoy", accent: "#581C87", sat: "#6b21a8", kind: "french" },
  "fuhe-huaishan-zhai": { brand: "福和慧", accent: "#166534", sat: "#15803d", kind: "vegan" },
  "l-ambroisie-paris": { brand: "L'Ambroisie", accent: "#7F1D1D", sat: "#991b1b", kind: "egg" },
  "da-vittorio-brusaporto": { brand: "Da Vittorio", accent: "#B45309", sat: "#d97706", kind: "pasta" },
  "ukai-teppanyaki-ginza": { brand: "うかい亭", accent: "#7F1D1D", sat: "#991b1b", kind: "beef" },
  "the-macallan-lounge": { brand: "Macallan", accent: "#78350F", sat: "#92400e", kind: "whisky" },
};
for (const [slug, info] of Object.entries(shopMap)) {
  const item = { slug, brand: info.brand, name: info.brand, accent: info.accent, sat: info.sat, kind: info.kind };
  const svg = buildSvg(item, 1, WH, HH);
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(`public/shops/${slug}.webp`);
  // 一张细节图
  const svg2 = buildSvg(item, 2, WH, HH);
  await sharp(Buffer.from(svg2)).webp({ quality: 82 }).toFile(`public/shops/${slug}-2.webp`);
}

console.log(`generated ${items.length * 3} product images + ${Object.keys(shopMap).length * 2} shop images`);
