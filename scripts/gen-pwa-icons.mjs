// 生成 PWA 图标：紫底（--ink）圆角方块 + 金色 DH 字样，呼应全站配色令牌。
// 输出 192 / 512（Android/Chrome 安装）+ 180（apple-touch-icon）。
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const INK = "#241A4D";
const GOLD = "#FFD23F";
const SIZE = 512;

// 圆角半径取边长的 ~28%，和 favicon.svg 的 rx=18/64 接近
const radius = Math.round(SIZE * 0.28);
const fontSize = Math.round(SIZE * 0.5);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}" fill="${INK}"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'PingFang SC', serif" font-size="${fontSize}" font-weight="700" fill="${GOLD}">DH</text>
</svg>`;

writeFileSync("public/icon.svg", svg);

await sharp(Buffer.from(svg)).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile("public/apple-touch-icon.png");
// maskable: 安全区留 10% padding，避免圆角被系统裁切
await sharp(Buffer.from(svg)).resize(512, 512, { fit: "contain", background: { r: 36, g: 26, b: 77, alpha: 1 } }).png().toFile("public/maskable-512.png");

console.log("icons generated");
