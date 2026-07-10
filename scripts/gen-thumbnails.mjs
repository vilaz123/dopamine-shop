#!/usr/bin/env node
// 生成商品/店铺图片的小尺寸缩略图，用于网格、卡片、相册缩略图条。
// 网格卡片在手机上实际只显示约 350px，原 900px 图每张 88–196KB → 缩略图约 30–45KB，省 2.5x+。
// 详情页主图保留原画质（不打缩略图）。
//
// 用法：node scripts/gen-thumbnails.mjs
// 幂等：源文件不比已有缩略图新则跳过。
import { readdir, stat, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const DIRS = ["public/products", "public/shops"];
const MAX_WIDTH = 560; // 2x 覆盖手机网格 ~350px 显示
const QUALITY = 70;

async function listWebp(dir) {
  const full = path.join(ROOT, dir);
  if (!existsSync(full)) return [];
  const files = await readdir(full);
  return files.filter((f) => f.endsWith(".webp") && !f.endsWith("-thumb.webp")).map((f) => path.join(full, f));
}

let generated = 0, skipped = 0, beforeBytes = 0, afterBytes = 0;

for (const dir of DIRS) {
  const files = await listWebp(dir);
  for (const file of files) {
    const out = file.replace(/\.webp$/, "-thumb.webp");
    const srcStat = await stat(file);
    const srcNewer = !existsSync(out) || (await stat(out)).mtimeMs < srcStat.mtimeMs;
    beforeBytes += srcStat.size;
    if (!srcNewer) { skipped++; continue; }
    await sharp(file)
      .rotate() // 修正 EXIF 旋转
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);
    afterBytes += (await stat(out)).size;
    generated++;
  }
}

console.log(`生成 ${generated} 张缩略图（560px/q70），跳过 ${skipped} 张未变。`);
console.log(`原图合计 ${beforeBytes} -> 缩略图合计 ${afterBytes} 字节（约 ${(afterBytes/1024).toFixed(0)}KB）`);
