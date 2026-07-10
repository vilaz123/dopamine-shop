/**
 * 把 `/products/x.webp` 这类原图路径映射到 `*-thumb.webp` 缩略图。
 * 缩略图由 scripts/gen-thumbnails.mjs 生成（560px / q70），用于网格、卡片、相册缩略图条，
 * 在手机上显示约 350px 的场景下比 900px 原图小约 3 倍，明显加快首屏。
 * 详情页主图不调用本函数，保留原画质。
 */
export function thumbUrl(imagePath: string): string {
  if (!imagePath) return imagePath;
  return imagePath.replace(/\.webp$/, "-thumb.webp");
}
