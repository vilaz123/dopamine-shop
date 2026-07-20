// 生成 PWA 图标：主页多巴胺三色（蜜桃粉/暖杏/奶油黄）混合渐变底 + 深紫 DH 字样。
// 呼应 home 主题：--page-bg #FFF9C4 / --page-accent #F8BBD0 / --page-highlight #FFCCBC / --page-ink #AD5380。
// 输出 192 / 512（Android/Chrome 安装）+ 180（apple-touch-icon）+ maskable。
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SIZE = 512;
const radius = Math.round(SIZE * 0.28);
const fontSize = Math.round(SIZE * 0.46);

// 多色径向渐变叠加在奶油黄底上，模拟主页 page-paint 的多巴胺混色感。
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="g1" cx="22%" cy="18%" r="62%">
      <stop offset="0%" stop-color="#F8BBD0" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#F8BBD0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="84%" cy="22%" r="58%">
      <stop offset="0%" stop-color="#FFCCBC" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#FFCCBC" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3" cx="78%" cy="86%" r="64%">
      <stop offset="0%" stop-color="#AD5380" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#AD5380" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g4" cx="18%" cy="82%" r="52%">
      <stop offset="0%" stop-color="#F8BBD0" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#F8BBD0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}" fill="#FFF9C4"/>
  <rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}" fill="url(#g1)"/>
  <rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}" fill="url(#g2)"/>
  <rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}" fill="url(#g3)"/>
  <rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}" fill="url(#g4)"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'PingFang SC', serif" font-size="${fontSize}" font-weight="700" fill="#241A4D">DH</text>
</svg>`;

writeFileSync("public/icon.svg", svg);

await sharp(Buffer.from(svg)).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile("public/apple-touch-icon.png");

// maskable：系统会按形状裁切，背景铺满（去掉圆角），DH 字缩小到中心安全区
const pad = Math.round(SIZE * 0.18);
const maskFont = Math.round(SIZE * 0.34);
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="m1" cx="22%" cy="18%" r="62%"><stop offset="0%" stop-color="#F8BBD0" stop-opacity="0.95"/><stop offset="100%" stop-color="#F8BBD0" stop-opacity="0"/></radialGradient>
    <radialGradient id="m2" cx="84%" cy="22%" r="58%"><stop offset="0%" stop-color="#FFCCBC" stop-opacity="0.95"/><stop offset="100%" stop-color="#FFCCBC" stop-opacity="0"/></radialGradient>
    <radialGradient id="m3" cx="78%" cy="86%" r="64%"><stop offset="0%" stop-color="#AD5380" stop-opacity="0.55"/><stop offset="100%" stop-color="#AD5380" stop-opacity="0"/></radialGradient>
    <radialGradient id="m4" cx="18%" cy="82%" r="52%"><stop offset="0%" stop-color="#F8BBD0" stop-opacity="0.7"/><stop offset="100%" stop-color="#F8BBD0" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="#FFF9C4"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#m1)"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#m2)"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#m3)"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#m4)"/>
  <text x="50%" y="${pad + (SIZE - 2 * pad) / 2 + maskFont * 0.05}" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'PingFang SC', serif" font-size="${maskFont}" font-weight="700" fill="#241A4D">DH</text>
</svg>`;
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile("public/maskable-512.png");

console.log("icons generated (dopamine tri-color)");
