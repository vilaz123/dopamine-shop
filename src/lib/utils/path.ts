export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string) {
  if (!basePath) return path;
  if (!path.startsWith("/")) return path;
  if (path === "/") return `${basePath}/`;
  if (path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}
