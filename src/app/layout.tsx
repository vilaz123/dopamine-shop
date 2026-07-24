import type { Metadata, Viewport } from "next";
import { Baloo_2, Quicksand } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { RewardFlash } from "@/components/asset/RewardFlash";
import { FlyToCart } from "@/components/asset/FlyToCart";
import { AccountSync } from "@/components/auth/AccountSync";
import { ServiceWorkerRegister } from "@/components/common/ServiceWorkerRegister";

// 卡通可爱风：标题 Baloo 2（圆润饱满），正文 Quicksand（圆润 sans）。
// next/font 自托管，静态导出兼容，无外部请求。
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dopahub 多巴胺仓 | 虚拟下单，真实不付款",
  description: "复刻真实电商快感，但切断真实扣款与真实配送的虚拟消费空间。",
  manifest: "/manifest.webmanifest",
  applicationName: "多巴胺仓",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "多巴胺仓",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#AD5380",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${baloo.variable} ${quicksand.variable}`}>
      <body>
        <Header />
        <AccountSync />
        <ServiceWorkerRegister />
        <RewardFlash />
        <FlyToCart />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
