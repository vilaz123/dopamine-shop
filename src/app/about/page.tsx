import { ButtonLink } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <section className="container-shell py-16">
      <div className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">About</p>
        <h1 className="font-display mt-4 text-6xl leading-none md:text-8xl">一个有电商外壳的冲动消费缓冲器。</h1>
        <p className="mt-8 text-xl leading-9 text-[#554c43]">VoidCart 不销售真实商品，不处理真实支付，也不会把任何包裹送到你门口。它只是把“浏览、加购、下单、等待物流”的多巴胺回路拆出来，做成一次安全、轻量、可分享的体验。</p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          ["透明", "所有页面都明确说明：这里没有真实交易。"],
          ["轻量", "第一版不需要服务器和数据库，静态部署即可使用。"],
          ["可升级", "数据服务已预留接口，未来可接入账号、数据库和后台。"],
        ].map(([title, body]) => (
          <div key={title} className="rounded-[2rem] bg-[#fffaf2] p-8">
            <h2 className="font-display text-4xl">{title}</h2>
            <p className="mt-4 leading-7 text-[#7a7167]">{body}</p>
          </div>
        ))}
      </div>
      <ButtonLink href="/shop" className="mt-12">去安全地逛逛</ButtonLink>
    </section>
  );
}
