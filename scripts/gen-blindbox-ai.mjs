// 为盲盒每个款式生成 AI 写实公仔图（IP 手办造型，非 emoji）。
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { blindSeries } from "../src/lib/data/blind-boxes.ts";

function loadEnv() {
  if (!existsSync(".env.local")) return {};
  const obj = {};
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) obj[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return obj;
}
const env = loadEnv();
const API_KEY = process.env.DASHSCOPE_API_KEY ?? env.DASHSCOPE_API_KEY;
if (!API_KEY) { console.error("✗ 缺 DASHSCOPE_API_KEY"); process.exit(1); }
const MODEL = process.env.WANX_MODEL ?? "wanx2.1-t2i-turbo";
const BASE = "https://dashscope.aliyuncs.com/api/v1";
const SIZE = "832*832"; // 方图（公仔居中）
const SUFFIX = ", cute collectible vinyl figure product photo, designer toy, blind box figure, soft studio lighting, clean light background, centered, highly detailed, 8k";
const NEG = "text, watermark, logo, brand mark, scary, ugly, deformed, low quality";

// 每个 series 一个统一的角色风格 prompt，figure 的 name/accent 决定主题色与元素
const seriesStyle = {
  "mochi-planet-series": "a round chubby little star sprite character with a big head and small body",
  "skull-candy-series": "a cute small skull character with a candy-colored body, kawaii style, sweet but dark",
  "dimoo-dream-series": "a small dreamy boy character with a big head and soft features, like a little cloud creature",
};

async function submit(prompt) {
  const res = await fetch(`${BASE}/services/aigc/text2image/image-synthesis`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "X-DashScope-Async": "enable", "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, input: { prompt }, parameters: { size: SIZE, n: 1, negative_prompt: NEG } }),
  });
  const data = await res.json();
  if (!data?.output?.task_id) throw new Error(`submit: ${JSON.stringify(data).slice(0, 200)}`);
  return data.output.task_id;
}
async function poll(taskId) {
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4000));
    const data = await (await fetch(`${BASE}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${API_KEY}` } })).json();
    if (data?.output?.task_status === "SUCCEEDED") return data.output.results?.[0]?.url;
    if (data?.output?.task_status === "FAILED") throw new Error("failed");
    process.stdout.write(".");
  }
  throw new Error("timeout");
}

mkdirSync("public/products", { recursive: true });
const rarityBonus = { hidden: "glowing golden aura, sparkles, legendary rare", "super-rare": "shimmering holographic shine", rare: "pearlescent shine", common: "" };

(async () => {
  let n = 0, failed = 0;
  for (const s of blindSeries) {
    const style = seriesStyle[s.slug];
    for (const f of s.figures) {
      const path = `public/products/blindbox-${s.slug}-${f.id}.webp`;
      if (existsSync(path)) { n++; continue; }
      const prompt = `${style}, themed "${f.name}", main color ${f.accent}, ${rarityBonus[f.rarity]}${SUFFIX}`;
      process.stdout.write(`→ ${s.slug}/${f.id}`);
      try {
        const url = await poll(await submit(prompt));
        const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
        const c = await sharp(buf).resize({ width: 700, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
        writeFileSync(path, c);
        process.stdout.write(" ✓\n");
        n++;
      } catch (e) { console.log(`\n✗ ${f.id}: ${e.message}`); failed++; }
    }
  }
  console.log(`\n生成 ${n}，失败 ${failed}`);
})();
