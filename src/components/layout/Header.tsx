import Link from "next/link";
import { CartButton } from "./CartButton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f1e8]/90 backdrop-blur">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-3xl tracking-tight">VoidCart</Link>
        <nav className="hidden items-center gap-8 text-sm text-[#554c43] md:flex">
          <Link href="/shop" className="hover:text-black">虚拟商店</Link>
          <Link href="/orders" className="hover:text-black">我的订单</Link>
          <Link href="/about" className="hover:text-black">产品理念</Link>
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
