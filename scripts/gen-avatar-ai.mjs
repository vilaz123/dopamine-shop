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

// 身体状态描述（含 emaciated 干瘦 / thin 微饿 / normal / stuffed 太撑 / chubby 胖 / fat 超胖 / obese 极胖 / muscular 健壮 / sick 难受）
const bodies = {
  emaciated: "very thin and emaciated, sunken cheeks, pale sallow yellowish skin, bony, looks starving and weak, sad expression",
  thin: "slightly thin, a bit hungry looking, slim but okay",
  normal: "healthy normal body, happy and balanced",
  stuffed: "stuffed and bloated, very full round belly, holding its swollen tummy, uncomfortable overfed expression",
  chubby: "chubby and plump, pleasantly round and soft",
  fat: "very fat and round, big round belly, heavy",
  obese: "extremely obese and huge, enormous round belly, very heavy, barely able to stand",
  muscular: "fit and muscular, toned athletic body, strong and healthy from exercise",
  sick: "looking unwell, greenish queasy face, sweating, nauseous, holding stomach, sick expression",
  pig: "transformed into a round chubby cartoon pig, pink piggy, snout and floppy ears, very fat",
};
const spirits = {
  energetic: "bright energetic eyes, beaming, full of energy and vitality",
  ok: "calm neutral expression",
  tired: "droopy tired eyes, sleepy and exhausted, dark circles, low energy",
  happy: "big joyful smile, laughing happily, sparkling eyes, ecstatic",
  sad: "sad teary eyes, frowning, downcast, melancholy expression",
  sleeping: "fast asleep, eyes closed peacefully, little Zzz, snoozing, cozy",
};

// 生图清单：扩大状态覆盖。pig 不分 shape 统一一张；其余按"高影响组合"生图，
// 不是全笛卡尔积(会爆炸)，挑每个 shape 下最有戏的 body×spirit 组合。
const list = [];
// 每个 shape：所有 body 各一张默认精神；再加精神差异组合
const bodyDefault = { emaciated: "sad", thin: "ok", normal: "energetic", stuffed: "ok", chubby: "happy", fat: "ok", obese: "tired", muscular: "energetic", sick: "sad" };
const extraSpirits = [
  ["normal", "happy"], ["normal", "tired"], ["normal", "ok"], ["normal", "sleeping"], ["normal", "sad"],
  ["chubby", "happy"], ["chubby", "tired"], ["chubby", "sleeping"],
  ["fat", "happy"], ["fat", "tired"],
  ["stuffed", "happy"], ["stuffed", "sad"],
  ["emaciated", "sad"], ["emaciated", "sleeping"],
  ["thin", "ok"], ["thin", "tired"],
  ["muscular", "energetic"], ["muscular", "happy"],
  ["sick", "sad"], ["sick", "sleeping"],
  ["obese", "tired"], ["obese", "sad"],
];
for (const [sh, shp] of Object.entries(shapes)) {
  for (const [bk, sp] of Object.entries(bodyDefault)) {
    if (bk === "pig") continue;
    list.push({ file: `${sh}-${bk}-${sp}`, prompt: `${shp}, ${bodies[bk]}, ${spirits[sp]}, ${STYLE}` });
  }
  for (const [bk, sp] of extraSpirits) {
    const file = `${sh}-${bk}-${sp}`;
    if (list.some((it) => it.file === file)) continue; // 默认已覆盖则跳过
    list.push({ file, prompt: `${shp}, ${bodies[bk]}, ${spirits[sp]}, ${STYLE}` });
  }
}
list.push({ file: "pig-ok", prompt: `${bodies.pig}, ${spirits.ok}, ${STYLE}` });
list.push({ file: "pig-happy", prompt: `${bodies.pig}, ${spirits.happy}, ${STYLE}` });
list.push({ file: "pig-tired", prompt: `${bodies.pig}, ${spirits.tired}, ${STYLE}` });

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
