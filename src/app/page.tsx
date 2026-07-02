import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

export default function HomePage() {
  const featured = products.slice(0, 6);
  const totalSaved = products.slice(0, 4).reduce((sum, product) => sum + product.price, 0);

  return (
    <>
      <section className="bg-[#0b0b0b] text-[#f6f1e8]">
        <div className="container-shell grid min-h-[78vh] items-center gap-12 py-20 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.38em] text-[#b5975a]">Virtual Commerce Atelier</p>
            <h1 className="font-display max-w-4xl text-6xl leading-[.88] md:text-8xl">买下它，只在想象里。</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/70">一个不会扣款、不会发货、不会后悔的虚拟购物空间。满足购买欲，保护真实钱包。</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/shop" variant="light">开始虚拟购物</ButtonLink>
              <ButtonLink href="/orders" variant="ghost" className="border-white/20 text-[#f6f1e8] hover:border-white/60">查看我的订单</ButtonLink>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[.06] p-8 backdrop-blur">
            <p className="text-sm text-white/55">本季假装消费精选</p>
            <div className="mt-8 space-y-7">
              {products.slice(0, 3).map((product) => (
                <Link href={`/shop/${product.slug}`} key={product.slug} className="flex items-center justify-between border-b border-white/10 pb-5 last:border-0">
                  <div>
                    <h3 className="font-display text-3xl">{product.name}</h3>
                    <p className="text-sm text-white/50">{product.subtitle}</p>
                  </div>
                  <Price value={product.price} className="font-display text-2xl text-[#b5975a]" />
                </Link>
              ))}
            </div>
            <div className="mt-10 rounded-3xl bg-[#f6f1e8] p-6 text-[#0b0b0b]">
              <p className="text-sm text-[#7a7167]">如果这些都是真实购买，你会少掉</p>
              <p className="font-display mt-2 text-5xl"><Price value={totalSaved} /></p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-24">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">New Arrivals</p>
            <h2 className="font-display mt-3 text-5xl">今日虚拟新品</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 text-sm font-semibold md:flex">全部商品 <ArrowRight size={16} /></Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      <section className="container-shell rounded-[2.5rem] bg-[#fffaf2] p-10 md:p-16">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            ["Browse", "像真实电商一样浏览，但没有真实消费风险。"],
            ["Cart", "把冲动装进购物车，让大脑先获得反馈。"],
            ["Calm", "生成虚拟订单和物流，明天再决定是否真的需要。"],
          ].map(([title, body]) => (
            <div key={title}>
              <p className="font-display text-4xl">{title}</p>
              <p className="mt-4 leading-7 text-[#7a7167]">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
