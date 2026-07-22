// 用阿里云通义万相（DashScope）生成米其林餐厅/菜品的写实图。
// 异步：提交任务 → 轮询 task → 下载 → sharp 转 webp。
// 主图 AI 生成；detail 图用 sharp 从主图裁切变体（省 API）。
//
// 使用：把 DASHSCOPE_API_KEY 放进 .env.local，然后 `node scripts/gen-michelin-ai.mjs`
// 可选环境变量：WANX_MODEL（默认 wanx2.1-t2i-plus；写实优先；免费额度用 wanx2.1-t2i-turbo）
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

// ---- 读 .env.local 拿 key ----
function loadEnv() {
  const p = ".env.local";
  if (!existsSync(p)) return {};
  const obj = {};
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) obj[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return obj;
}
const env = loadEnv();
const API_KEY = process.env.DASHSCOPE_API_KEY ?? env.DASHSCOPE_API_KEY;
if (!API_KEY) {
  console.error("✗ 未找到 DASHSCOPE_API_KEY。请把阿里云 DashScope key 放进 .env.local：");
  console.error('  DASHSCOPE_API_KEY=sk-xxxxxxxx');
  process.exit(1);
}
const MODEL = process.env.WANX_MODEL ?? "wanx2.1-t2i-plus";
const BASE = "https://dashscope.aliyuncs.com/api/v1";

const SUFFIX = ", ultra realistic, professional food photography, highly detailed, 8k, shallow depth of field, appetizing, Michelin-star fine dining plating";
const NEG = "cartoon, illustration, anime, painting, drawing, low quality, blurry, deformed, text, watermark, ugly";

// size: 菜品竖 832*1248(≈4:5)，餐厅横 1280*960(4:3)
const SIZE_DISH = "832*1248";
const SIZE_SHOP = "1280*960";

const dishes = [
  { slug: "kikunoi-kaiseki-dinner", p: "traditional Japanese kaiseki multi-course meal, multiple small elegant dishes on black lacquer trays, seasonal sashimi soup and vegetables, minimalist Japanese presentation, dark moody background, top-down overhead view, soft warm lighting" },
  { slug: "kikunoi-kaiseki-lunch", p: "Japanese kaiseki jubako bento box, lacquered box with grilled fish tempura rice and pickles, elegant minimalist, dark background, top-down view" },
  { slug: "kikunoi-matsutake-gohan", p: "matsutake mushroom dobin-mushi soup in ceramic teapot, clear broth with pine mushroom ginkgo nut mitsuba, Japanese ceramic tableware, dark moody, 45 degree angle" },
  { slug: "jiro-omakase-nigiri", p: "Edomae sushi omakase assortment, nigiri of fatty tuna otoro akami shrimp and shellfish arranged on a wooden sushi board, professional sushi photography, dark slate background, top-down view" },
  { slug: "jiro-tuna-otoro", p: "macro close-up of one piece of fatty bluefin tuna otoro nigiri sushi, glistening marbled fatty tuna on vinegared rice, dark background, shallow depth of field" },
  { slug: "xiagong-peking-duck", p: "Peking roast duck, sliced crispy duck skin and meat arranged neatly on white plate with hoisin sauce scallions and lotus leaf pancakes, Chinese fine dining, dark wood background, 45 degree angle" },
  { slug: "xiagong-business-set", p: "luxurious Chinese Cantonese banquet table spread, abalone lobster suckling pig Buddha jumps over wall and multiple dishes, round banquet table, dark elegant, top-down wide view" },
  { slug: "xiagong-buddha-jumps-soup", p: "Buddha jumps over wall soup, rich golden broth with abalone sea cucumber fish maw and mushroom in a porcelain tureen bowl, Chinese banquet, dark moody, close-up" },
  { slug: "guysavoy-art-tasting", p: "French Michelin fine dining tasting menu, multiple artfully plated courses on white porcelain plates, foie gras lobster and artichoke, elegant minimalist, dark background, top-down view" },
  { slug: "guysavoy-artichoke-truffle", p: "marbled chicken and foie gras artichoke terrine sliced thin, drizzled with black truffle vinaigrette, French fine dining plating on white plate, dark elegant, macro top-down" },
  { slug: "fuhe-vegetable-kaiseki", p: "vegetarian Buddhist kaiseki, plant-based dishes tofu mushrooms seasonal vegetables on earthy ceramic ware, natural green minimalist, dark green background, top-down view" },
  { slug: "fuhe-tofu-white-truffle", p: "silken tofu with shaved white Alba truffle flakes, white truffle on soft tofu in a warm stone bowl, elegant Japanese-Italian fusion, dark background, macro 45 degree" },
  { slug: "lambroisie-egg-caviar", p: "soft-boiled egg topped with glossy black caviar in a silver shell dish, coquille oeuf au caviar, French fine dining, dark luxurious background, macro top-down" },
  { slug: "lambroisie-chocolate-souffle", p: "chocolate souffle, risen molten chocolate souffle oozing lava, with a scoop of vanilla ice cream, French dessert, dark elegant, close-up 45 degree" },
  { slug: "davittorio-tagliolini-truffle", p: "tagliolini egg pasta with generous shaved white Alba truffle and melted butter, on white plate, Italian fine dining, dark background, 45 degree top-down" },
  { slug: "davittorio-paccheri-seafood", p: "paccheri large tube pasta with shrimp mussels clams and calamari in San Marzano tomato sauce, Italian fine dining, white bowl, dark background, top-down" },
  { slug: "ukai-ohmi-gyu-teppan", p: "A5 wagyu beef sirloin thick cut on a sizzling teppan iron grill, heavily marbled Japanese beef with grill marks, grilled asparagus, dark dramatic lighting, close-up 45 degree" },
  { slug: "ukai-aba-lion-course", p: "Japanese teppanyaki course spread, grilled wagyu beef shrimp and abalone on iron plate with vegetables, theatrical plating, dark moody, top-down view" },
  { slug: "macallan-vintage-flight", p: "three glasses of aged single malt Scotch whisky tasting flight, amber liquid in crystal tasting glasses on a wooden flight board, dark wood bar, moody lighting, 45 degree" },
  { slug: "macallan-rare-cask-pour", p: "single crystal glass of Macallan rare cask whisky with a large clear ice ball, amber whisky glowing, dark moody bar background, macro close-up" },
  { slug: "macallan-whisky-pairing-set", p: "whisky pairing set, three glasses of scotch with small bites smoked salmon tartare Iberico ham and truffle chocolate, dark wood bar, top-down view" },
  { slug: "pinchiorri-truffle-banquet", p: "Italian white truffle tasting banquet, multiple courses with shaved Alba white truffle over egg fonduta polenta and veal, fine dining, elegant, dark warm background, top-down view" },
  { slug: "pinchiorri-fonduta-truffle", p: "Italian fonduta melted fontina cheese fondue in a warm ceramic pot with crispy bread for dipping, topped with shaved white Alba truffle, Piedmont, dark cozy background, 45 degree angle" },
  { slug: "roca-creative-menu", p: "modern molecular gastronomy creative fine dining spread, multiple artistic small plates, spherification olive liquid nitrogen dessert, avant-garde plating on white ceramic, minimalist dark background, top-down view" },
  { slug: "roca-olive-molecular", p: "molecular gastronomy olive deconstruction, five different preparations of olive spheres chips powder and fried, artistic plating on dark slate, avant-garde minimalist, top-down macro" },
  { slug: "pavillon-seafood-tower", p: "towering nine-tier stainless steel seafood plateau tower, fresh oysters lobster shrimp crab clams on ice with lemon, French seafood feast, luxury, dark elegant background, top-down view" },
  { slug: "pavillon-oyster-champagne", p: "six fresh French oysters on ice with lemon wedges and a glass of champagne beside, raw oysters, dark elegant seafood plating, top-down 45 degree" },
  { slug: "lijia-imperial-banquet", p: "Chinese imperial court cuisine banquet, twenty small elegant dishes on fine porcelain, bird nest soup and delicate pastries, Qing dynasty royal feast, dark elegant, top-down view" },
  { slug: "lijia-peking-soup", p: "clear bird nest soup in imperial style, crystal clear broth with white edible bird nest in a fine porcelain bowl, Chinese court cuisine, dark elegant, close-up" },
];

const shops = [
  { slug: "kikunoi-akasaka", p: "elegant Japanese kaiseki restaurant interior, traditional tatami room with warm wood, dark moody fine dining atmosphere, Michelin" },
  { slug: "sukiyabashi-jiro-ginza", p: "intimate 10-seat sushi counter restaurant, wooden sushi bar with chef, dark minimalist Tokyo Michelin" },
  { slug: "xia-gong-beijing", p: "luxurious Chinese Cantonese restaurant dining room, red and gold elegant decor, round banquet tables, five star hotel" },
  { slug: "guy-savoy-paris", p: "Michelin three star French restaurant interior, elegant Parisian fine dining, warm lighting, art on walls, marble columns" },
  { slug: "fuhe-huaishan-zhai", p: "Zen Buddhist vegetarian restaurant interior, minimalist green natural decor, Shanghai fine dining, calm" },
  { slug: "l-ambroisie-paris", p: "classic French Michelin three star restaurant interior, ornate classical decor, candlelight, vaulted ceiling" },
  { slug: "da-vittorio-brusaporto", p: "Italian family Michelin restaurant interior, warm rustic elegant Piedmont countryside dining room" },
  { slug: "ukai-teppanyaki-ginza", p: "Japanese teppanyaki restaurant, iron grill counter with chef cooking, dark dramatic Tokyo fine dining" },
  { slug: "the-macallan-lounge", p: "luxury whisky lounge bar interior, dark wood shelves of Scotch whisky, leather armchairs, moody warm lighting" },
  { slug: "enoteca-pinchiorri-firenze", p: "Michelin three star Italian fine dining restaurant interior, 16th century Florentine palace, vaulted ceilings, wine cellar, warm elegant" },
  { slug: "el-celler-de-can-roca", p: "modern minimalist Michelin three star restaurant interior, Catalan contemporary design, warm wood, calm natural light, creative gastronomy" },
  { slug: "le-pavillon-de-la-mer", p: "upscale French seafood restaurant interior, elegant coastal decor, fresh seafood on ice display, champagne, bright refined" },
  { slug: "lijia-cuisine-beijing", p: "traditional Chinese imperial court cuisine restaurant interior, courtyard house hutong, antique wooden furniture, red lanterns, elegant private dining" },
];

async function submit(prompt, size) {
  const res = await fetch(`${BASE}/services/aigc/text2image/image-synthesis`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "X-DashScope-Async": "enable", "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, input: { prompt: prompt + SUFFIX }, parameters: { size, n: 1, negative_prompt: NEG } }),
  });
  const data = await res.json();
  if (!data?.output?.task_id) throw new Error(`submit failed: ${JSON.stringify(data)}`);
  return data.output.task_id;
}

async function poll(taskId) {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4000));
    const res = await fetch(`${BASE}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${API_KEY}` } });
    const data = await res.json();
    const status = data?.output?.task_status;
    if (status === "SUCCEEDED") return data.output.results?.[0]?.url;
    if (status === "FAILED") throw new Error(`task failed: ${JSON.stringify(data)}`);
    process.stdout.write(".");
  }
  throw new Error("task timeout");
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// 从主图生成 detail 变体：中心放大 + 局部裁切（菜品 2 张 / 餐厅 1 张）
async function variants(buf, dir, slug, count) {
  for (let i = 0; i < count; i++) {
    const crop = i === 0
      ? { left: 0.12, top: 0.1, w: 0.76, h: 0.8 }   // 中心主体放大
      : { left: 0.2, top: 0.25, w: 0.6, h: 0.6 };    // 局部特写
    const meta = await sharp(buf).metadata();
    const W = meta.width, Hh = meta.height;
    const v = await sharp(buf)
      .extract({ left: Math.round(W * crop.left), top: Math.round(Hh * crop.top), width: Math.round(W * crop.w), height: Math.round(Hh * crop.h) })
      .modulate({ brightness: i === 0 ? 1.0 : 1.05, saturation: 1.05 })
      .webp({ quality: 84 })
      .toBuffer();
    writeFileSync(`${dir}/${slug}-${i + 2}.webp`, v);
  }
}

async function genOne(item, dir, size, variantCount) {
  const path = `${dir}/${item.slug}.webp`;
  // 主图存在但 detail 变体缺失时也要补（不 skip）
  const detailMissing = variantCount > 0 && Array.from({ length: variantCount }, (_, i) => `${dir}/${item.slug}-${i + 2}.webp`).some((p) => !existsSync(p));
  if (existsSync(path) && !detailMissing) { console.log(`✓ skip ${item.slug}（已存在）`); return; }
  let buf;
  if (existsSync(path) && detailMissing) {
    buf = readFileSync(path); // 已有主图，只补变体
  } else {
    process.stdout.write(`→ ${item.slug} 提交`);
    const taskId = await submit(item.p, size);
    const url = await poll(taskId);
    buf = await download(url);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path, buf);
    console.log(" ✓");
  }
  if (variantCount > 0) await variants(buf, dir, item.slug, variantCount);
}

(async () => {
  mkdirSync("public/products", { recursive: true });
  mkdirSync("public/shops", { recursive: true });
  console.log(`模型: ${MODEL} | 菜品 ${dishes.length} + 餐厅 ${shops.length}`);
  const failed = [];
  for (const d of dishes) { try { await genOne(d, "public/products", SIZE_DISH, 2); } catch (e) { console.log(`\n✗ ${d.slug}: ${e.message}`); failed.push(["dish", d]); } }
  for (const s of shops) { try { await genOne(s, "public/shops", SIZE_SHOP, 1); } catch (e) { console.log(`\n✗ ${s.slug}: ${e.message}`); failed.push(["shop", s]); } }
  console.log(failed.length ? `\n完成，失败 ${failed.length} 个（重跑即可续传）` : "\n全部完成 🎉");
})();
