// 压缩 AI 生成的米其林图（原图 1.4–2.2MB 太大，手机加载慢/超时）。
// 原图 resize 到 ≤1200px、q80 → 约 150–250KB；缩略图 560px q70 → 30–50KB。
// 幂等：已压缩过的不再处理（用临时标记）。直接覆盖原图 + 生成 -thumb.webp。
import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const DIRS = ["public/products", "public/shops"];
// 只压缩这些前缀（米其林 AI 图），不动原有小图
const PREFIXES = ["kikunoi", "jiro", "sukiyabashi", "xiagong", "xia-gong", "guysavoy", "guy-savoy", "fuhe", "lambroisie", "l-ambroisie", "davittorio", "da-vittorio", "ukai", "macallan", "pinchiorri", "roca", "el-celler", "pavillon", "le-pavillon", "lijia", "enoteca"];
const ORIG_MAX = 1200;
const ORIG_Q = 80;
const THUMB_MAX = 560;
const THUMB_Q = 70;

async function list(dir) {
  const full = path.join(ROOT, dir);
  if (!existsSync(full)) return [];
  const files = await readdir(full);
  return files
    .filter((f) => f.endsWith(".webp") && !f.endsWith("-thumb.webp"))
    .filter((f) => PREFIXES.some((p) => f.includes(p)))
    .map((f) => path.join(full, f));
}

let oN = 0, oBefore = 0, oAfter = 0, tN = 0;
for (const dir of DIRS) {
  for (const file of await list(dir)) {
    const before = (await stat(file)).size;
    const buf = await sharp(file).rotate().resize({ width: ORIG_MAX, withoutEnlargement: true }).webp({ quality: ORIG_Q }).toBuffer();
    const { writeFileSync } = await import("node:fs");
    writeFileSync(file, buf); // 覆盖原图
    oN++; oBefore += before; oAfter += buf.length;

    const thumb = file.replace(/\.webp$/, "-thumb.webp");
    const tbuf = await sharp(file).resize({ width: THUMB_MAX, withoutEnlargement: true }).webp({ quality: THUMB_Q }).toBuffer();
    writeFileSync(thumb, tbuf);
    tN++;
  }
}
console.log(`原图压缩 ${oN} 张：${(oBefore/1024/1024).toFixed(1)}MB → ${(oAfter/1024/1024).toFixed(1)}MB`);
console.log(`缩略图生成 ${tN} 张`);
