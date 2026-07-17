import type { ReactNode } from "react";

/**
 * 页面级主题背景容器：给整页套一个主题色 + 不规则三色色块背景。
 * theme: "home" | "shop" | "food"，默认 home（蜜桃粉/暖杏/奶油黄）。
 * 用 .theme-* + .page-paint（见 globals.css）实现分区配色。
 */
export function PageTheme({
  theme = "home",
  children,
  className = "",
}: {
  theme?: "home" | "shop" | "food";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`theme-${theme} relative ${className}`}>
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />
      {children}
    </div>
  );
}
