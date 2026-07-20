// PWA 图标：鲜明的多巴胺三色拼接（蜜桃粉 / 暖杏 / 奶油黄）+ 深紫 DH。
// 不用淡渐变（缩放后会糊成单色），改用清晰的色块对角分割，保证小尺寸也认得出三色。
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SIZE = 512;
const radius = Math.round(SIZE * 0.26);
const fontSize = Math.round(SIZE * 0.44);

// 三色：粉 #F8BBD0 / 杏 #FFCCBC / 黄 #FFF9C4，对角分三块，交叠处用半透明过渡。
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <clipPath id="clip"><rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}"/></clipPath>
  </defs>
  <g clip-path="url(#clip)">
    <rect width="${SIZE}" height="${SIZE}" fill="#FFF9C4"/>
    <polygon points="0,0 ${SIZE},0 0,${SIZE}" fill="#F8BBD0"/>
    <polygon points="${SIZE},0 ${SIZE},${SIZE} 0,${SIZE}" fill="#FFCCBC" opacity="0.9"/>
    <circle cx="${SIZE * 0.78}" cy="${SIZE * 0.24}" r="${SIZE * 0.3}" fill="#FFD23F" opacity="0.5"/>
    <circle cx="${SIZE * 0.2}" cy="${SIZE * 0.8}" r="${SIZE * 0.26}" fill="#AD5380" opacity="0.35"/>
  </g>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'PingFang SC', serif" font-size="${fontSize}" font-weight="700" fill="#241A4D">DH</text>
</svg>`;

writeFileSync("public/icon.svg", svg);

await sharp(Buffer.from(svg)).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile("public/apple-touch-icon.png");

// maskable：铺满（无圆角），DH 缩到中心安全区
const maskFont = Math.round(SIZE * 0.32);
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="#FFF9C4"/>
  <polygon points="0,0 ${SIZE},0 0,${SIZE}" fill="#F8BBD0"/>
  <polygon points="${SIZE},0 ${SIZE},${SIZE} 0,${SIZE}" fill="#FFCCBC" opacity="0.9"/>
  <circle cx="${SIZE * 0.78}" cy="${SIZE * 0.24}" r="${SIZE * 0.3}" fill="#FFD23F" opacity="0.5"/>
  <circle cx="${SIZE * 0.2}" cy="${SIZE * 0.8}" r="${SIZE * 0.26}" fill="#AD5380" opacity="0.35"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'PingFang SC', serif" font-size="${maskFont}" font-weight="700" fill="#241A4D">DH</text>
</svg>`;
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile("public/maskable-512.png");

console.log("icons regenerated (vivid tri-color)");
