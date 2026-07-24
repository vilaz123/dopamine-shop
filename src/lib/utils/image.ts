/**
 * 图片资源版本号：图片文件更新后递增，强制浏览器/CDN 丢弃旧缓存。
 * 之前几何占位图与 AI 写实图同名同路径，手机浏览器按 URL 缓存了几何图，
 * 导致放大图仍是旧的「白盘+色块」。带 ?v= 后浏览器视为新资源重新拉取。
 * 每次大批量重新生成图片后，把这个版本号 +1 即可全站破缓存。
 */
export const IMAGE_VERSION = 6;

function withVersion(path: string): string {
  if (!path) return path;
  return path.includes("?") ? path : `${path}?v=${IMAGE_VERSION}`;
}

/**
 * 把 `/products/x.webp` 这类原图路径映射到 `*-thumb.webp` 缩略图（带版本号）。
 * 缩略图由 scripts/gen-thumbnails.mjs 生成，用于网格、卡片、相册缩略图条。
 */
export function thumbUrl(imagePath: string): string {
  if (!imagePath) return imagePath;
  return withVersion(imagePath.replace(/\.webp$/, "-thumb.webp"));
}

/** 原图 URL（带版本号破缓存）。详情页主图、放大图用。 */
export function assetUrl(imagePath: string): string {
  return withVersion(imagePath);
}

