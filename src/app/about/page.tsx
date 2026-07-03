import { ButtonLink } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <section className="container-shell py-16">
      <div className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">About Dopahub</p>
        <h1 className="font-display mt-4 text-6xl leading-none md:text-8xl">Dopahub 多巴胺仓：复刻电商快感，删除扣款痛苦。</h1>
        <p className="mt-8 text-xl leading-9 text-[#554c43]">这里可以浏览爆款、加购、凑满减、一键虚拟下单、查看物流、晒单领币。所有金额都是虚拟金额，无需真实支付；所有包裹都会永远停在派送中，不会真正送达。</p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          ["强反馈", "加购、下单、晒单都会发放多巴胺币、XP 和勋章。"],
          ["零损失", "没有银行卡、微信或支付宝通道，实际扣款永远是 ¥0。"],
          ["长周期", "虚拟钱包、等级、囤货库存、收藏夹和永远派送中的物流会持续保留满足感。"],
        ].map(([title, body]) => (
          <div key={title} className="rounded-[2rem] bg-[#fffaf2] p-8">
            <h2 className="font-display text-4xl">{title}</h2>
            <p className="mt-4 leading-7 text-[#7a7167]">{body}</p>
          </div>
        ))}
      </div>
      <ButtonLink href="/shop" className="mt-12">进入多巴胺仓</ButtonLink>
    </section>
  );
}
