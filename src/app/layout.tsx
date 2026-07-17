import type { Metadata } from "next";
import { Baloo_2, Quicksand } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { RewardFlash } from "@/components/asset/RewardFlash";
import { AccountSync } from "@/components/auth/AccountSync";

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
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${baloo.variable} ${quicksand.variable}`}>
      <body>
        <Header />
        <AccountSync />
        <RewardFlash />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
