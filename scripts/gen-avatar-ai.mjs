// 用通义万相生成分身形象卡：形状×身体状态×精神状态的可爱写实图。
// 复用 gen-shop-ai.mjs 的 dashscope 异步生图范式 + .env.local 的 DASHSCOPE_API_KEY。
// 离线预生成，落 public/avatars/，前端按状态切静态图（零运行成本、零 key 暴露）。
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

function loadEnv() {
  if (!existsSync(".env.local")) return {};
  const obj = {};
  for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
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
const SIZE = "832*1216"; // 竖向人形比例

const STYLE = "cute chibi style, kawaii, soft round shapes, big expressive eyes, pastel color palette, clean soft pastel background, 3D render, highly detailed, studio lighting";
const NEG = "realistic human photo, real person, photorealistic, scary, gory, violent, text, watermark, logo, brand mark, low quality, blurry, deformed extra limbs";

const shapes = {
  human: "a cute chibi human character, a small adorable person",
  cat: "a cute chibi cat character, an adorable kitten standing upright",
  bunny: "a cute chibi bunny character, an adorable fluffy rabbit standing upright",
};

// 身体状态描述（含 emaciated 干瘦 / thin 微饿 / normal / stuffed 太撑 / chubby 胖 / fat 超胖 / pig 变猪）
const bodies = {
  emaciated: "very thin and emaciated, sunken cheeks, pale sallow yellowish skin, bony, looks starving and weak, sad expression",
  thin: "slightly thin, a bit hungry looking, slim but okay",
  normal: "healthy normal body, happy and balanced",
  stuffed: "stuffed and bloated, very full round belly, holding its swollen tummy, uncomfortable overfed expression",
  chubby: "chubby and plump, pleasantly round and soft",
  fat: "very fat and round, big round belly, heavy",
  pig: "transformed into a round chubby cartoon pig, pink piggy, snout and floppy ears, very fat",
};
const spirits = {
  energetic: "bright energetic eyes, beaming, full of energy and vitality",
  ok: "calm neutral expression",
  tired: "droopy tired eyes, sleepy and exhausted, dark circles, low energy",
};

// 生图清单：降维——spirit 仅在 normal body 区分；pig 不分 shape 统一一张。
// 清单 = (shape×各body×ok) + (shape×normal×{energetic,tired}) + pig
const list = [];
for (const [sh, shp] of Object.entries(shapes)) {
  for (const [bk, bv] of Object.entries(bodies)) {
    if (bk === "pig") continue; // pig 单独加
    const sp = bk === "normal" ? "energetic" : "ok"; // normal 默认 energetic，其他 ok
    list.push({ file: `${sh}-${bk}-${sp}`, prompt: `${shp}, ${bv}, ${spirits[sp]}, ${STYLE}` });
  }
  // normal 的 tired/ok 两种精神差异
  list.push({ file: `${sh}-normal-ok`, prompt: `${shp}, ${bodies.normal}, ${spirits.ok}, ${STYLE}` });
  list.push({ file: `${sh}-normal-tired`, prompt: `${shp}, ${bodies.normal}, ${spirits.tired}, ${STYLE}` });
}
list.push({ file: "pig-ok", prompt: `${bodies.pig}, ${spirits.ok}, ${STYLE}` });

async function submit(prompt) {
  const res = await fetch(`${BASE}/services/aigc/text2image/image-synthesis`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "X-DashScope-Async": "enable", "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, input: { prompt: prompt + "" }, parameters: { size: SIZE, n: 1, negative_prompt: NEG } }),
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

mkdirSync("public/avatars", { recursive: true });
(async () => {
  console.log(`模型: ${MODEL} | 分身形象 ${list.length} 张`);
  const failed = [];
  for (const item of list) {
    const path = `public/avatars/${item.file}.webp`;
    if (existsSync(path)) { continue; }
    try {
      const buf = await genImage(item.prompt, item.file);
      const compressed = await sharp(buf).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
      writeFileSync(path, compressed);
      const thumb = await sharp(compressed).resize({ width: 440, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
      writeFileSync(`public/avatars/${item.file}-thumb.webp`, thumb);
    } catch (e) { console.log(`\n✗ ${item.file}: ${e.message}`); failed.push(item.file); }
  }
  console.log(failed.length ? `\n完成，失败 ${failed.length}: ${failed.join(", ")}` : "\n全部完成 🎉");
})();
