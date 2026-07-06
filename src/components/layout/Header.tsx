import Link from "next/link";
import { CartButton } from "./CartButton";
import { AssetHeaderButton } from "./AssetHeaderButton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f1e8]/90 backdrop-blur">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-tight md:text-3xl">Dopahub 多巴胺仓</Link>
        <nav className="hidden items-center gap-7 text-sm text-[#554c43] md:flex">
          <Link href="/shop" className="hover:text-black">虚拟商店</Link>
          <Link href="/assets" className="hover:text-black">我的资产</Link>
          <Link href="/community" className="hover:text-black">多巴胺广场</Link>
          <Link href="/orders" className="hover:text-black">我的订单</Link>
          <Link href="/profile" className="hover:text-black">我的账号</Link>
          <Link href="/about" className="hover:text-black">产品理念</Link>
        </nav>
        <div className="flex items-center gap-3"><AssetHeaderButton /><CartButton /></div>
      </div>
    </header>
  );
}
