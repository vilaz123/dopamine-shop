// 用通义万相生成奢侈品/盲盒区的写实图（复用 .env.local 的 DASHSCOPE_API_KEY）。
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

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
const SUFFIX = ", ultra realistic professional product photography, highly detailed, 8k, luxury, elegant, shallow depth of field, studio lighting";
const NEG = "cartoon, illustration, anime, painting, drawing, low quality, blurry, deformed, text, watermark, fake, counterfeit, logo, brand mark, trademark";
const SIZE = "832*1248";

// 奢侈品致敬款：画风格化的实物（手袋/腕表/珠宝），不画真实商标
const dishes = [
  { slug: "flyhorse-birkin-25-homage", p: "luxury designer handbag, structured tote bag in cognac brown Togo leather with saddle stitching and gold buckle, elegant, on a clean beige background, top-down 45 degree" },
  { slug: "louisvelvet-speedy-homage", p: "classic monogram canvas handbag, brown coated canvas with vintage pattern and vachetta leather trim, gold zipper, on clean white background, 45 degree" },
  { slug: "royaloyster-submariner-homage", p: "luxury stainless steel diving watch, black dial and black ceramic bezel, oyster bracelet, professional product shot, dark elegant background, macro close-up" },
  { slug: "goldmoon-daytona-homage", p: "luxury stainless steel chronograph watch, white panda dial with three subdials, black ceramic tachymeter bezel, professional product shot, dark background, macro" },
  { slug: "eternity-diamond-ring-homage", p: "platinum six-prong solitaire diamond ring, one carat round brilliant diamond, sparkling fire, on white satin, macro, luxury jewelry photography" },
  { slug: "carthage-goldnecklace-homage", p: "18k yellow gold pendant necklace, interlocking C motif pendant with small diamonds, on elegant neckline display, luxury jewelry, warm background, macro" },
];

async function submit(prompt) {
  const res = await fetch(`${BASE}/services/aigc/text2image/image-synthesis`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "X-DashScope-Async": "enable", "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, input: { prompt: prompt + SUFFIX }, parameters: { size: SIZE, n: 1, negative_prompt: NEG } }),
  });
  const data = await res.json();
  if (!data?.output?.task_id) throw new Error(`submit failed: ${JSON.stringify(data)}`);
  return data.output.task_id;
}
async function poll(taskId) {
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4000));
    const res = await fetch(`${BASE}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${API_KEY}` } });
    const data = await res.json();
    const s = data?.output?.task_status;
    if (s === "SUCCEEDED") return data.output.results?.[0]?.url;
    if (s === "FAILED") throw new Error("task failed");
    process.stdout.write(".");
  }
  throw new Error("timeout");
}
async function genImage(prompt, label) {
  process.stdout.write(`→ ${label} 提交`);
  const url = await poll(await submit(prompt));
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  process.stdout.write(" ✓\n");
  return buf;
}

mkdirSync("public/products", { recursive: true });
(async () => {
  console.log(`模型: ${MODEL} | 奢侈品 ${dishes.length}`);
  const failed = [];
  for (const d of dishes) {
    for (let v = 1; v <= 3; v++) {
      const suffix = v === 1 ? "" : `-${v}`;
      const path = `public/products/${d.slug}${suffix}.webp`;
      if (existsSync(path)) { continue; }
      const ang = v === 1 ? "hero shot" : v === 2 ? "close-up detail of material and hardware" : "product on a marble surface, lifestyle";
      try {
        const buf = await genImage(`${d.p}, ${ang}`, `${d.slug}${suffix}`);
        const compressed = await sharp(buf).resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
        writeFileSync(path, compressed);
        const thumb = await sharp(compressed).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 68 }).toBuffer();
        writeFileSync(`public/products/${d.slug}${suffix}-thumb.webp`, thumb);
      } catch (e) { console.log(`\n✗ ${d.slug}${suffix}: ${e.message}`); failed.push(`${d.slug}${suffix}`); }
    }
  }
  console.log(failed.length ? `\n完成，失败 ${failed.length}: ${failed.join(", ")}` : "\n全部完成 🎉");
})();
