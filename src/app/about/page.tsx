import { ButtonLink } from "@/components/ui/Button";
import { PageTheme } from "@/components/common/PageTheme";

export default function AboutPage() {
  return (
    <PageTheme className="min-h-screen">
      <section className="container-shell py-10 sm:py-16">
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>About Dopahub</p>
          <h1 className="font-display mt-4 text-3xl leading-tight sm:text-4xl md:text-5xl" style={{ color: "var(--page-ink)" }}>Dopahub 多巴胺仓：复刻电商快感，删除扣款痛苦。</h1>
          <p className="mt-6 text-base leading-7 sm:mt-8 sm:text-xl sm:leading-9" style={{ color: "var(--page-soft)" }}>这里可以浏览爆款、加购、凑满减、一键虚拟下单、查看物流、晒单领币。所有金额都是虚拟金额，无需真实支付；所有包裹都会永远停在派送中，不会真正送达。</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            ["强反馈", "加购、下单、晒单都会发放多巴胺币、XP 和勋章。"],
            ["零损失", "没有银行卡、微信或支付宝通道，实际扣款永远是 ¥0。"],
            ["长周期", "虚拟钱包、等级、囤货库存、收藏夹和永远派送中的物流会持续保留满足感。"],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[1.5rem] border border-white/60 bg-white/80 p-5 shadow-sm sm:rounded-[2rem] sm:p-8">
              <h2 className="font-display text-3xl sm:text-4xl" style={{ color: "var(--page-ink)" }}>{title}</h2>
              <p className="mt-4 leading-7" style={{ color: "var(--page-soft)" }}>{body}</p>
            </div>
          ))}
        </div>
        <ButtonLink href="/shop" className="mt-12">进入多巴胺仓</ButtonLink>
      </section>
    </PageTheme>
  );
}
