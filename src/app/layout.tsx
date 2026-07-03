import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { RewardFlash } from "@/components/asset/RewardFlash";

export const metadata: Metadata = {
  title: "Dopahub 多巴胺仓 | 虚拟下单，真实不付款",
  description: "复刻真实电商快感，但切断真实扣款与真实配送的虚拟消费空间。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <RewardFlash />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
