import type { NextConfig } from "next";

const repoName = "dopamine-shop";
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: isGithubPages ? `/${repoName}` : undefined,
  assetPrefix: isGithubPages ? `/${repoName}/` : undefined,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
