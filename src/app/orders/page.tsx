"use client";

import { useEffect, useMemo, useState } from "react";
import { useOrderStore } from "@/stores/order-store";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { getTrackingProgress } from "@/lib/tracking/stages";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TrackingTimeline } from "@/components/order/TrackingTimeline";
import { OrderSuccessModal } from "@/components/order/OrderSuccessModal";
import { PageTheme } from "@/components/common/PageTheme";

export default function OrdersPage() {
  const orders = useOrderStore((state) => state.orders);
  const signOrder = useOrderStore((state) => state.signOrder);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedId(params.get("order"));
    setShowSuccess(params.get("success") === "1");
  }, []);

  const selected = useMemo(() => orders.find((order) => order.id === (selectedId ?? orders[0]?.id)) ?? null, [orders, selectedId]);

  if (orders.length === 0) {
    return (
      <PageTheme className="min-h-screen">
      <section className="container-shell py-10 sm:py-16">
        <div className="rounded-[1.75rem] border border-dashed border-black/15 bg-white p-6 text-center sm:rounded-[2.5rem] sm:p-12">
          <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Orders</p>
          <h1 className="font-display mt-3 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>还没有虚拟订单。</h1>
          <p className="mt-5" style={{ color: "var(--page-soft)" }}>当购买欲出现时，可以先在 Dopahub 多巴胺仓下一单。</p>
          <ButtonLink href="/shop" className="mt-8">开始虚拟购物</ButtonLink>
        </div>
      </section>
      </PageTheme>
    );
  }

  return (
    <PageTheme className="min-h-screen">
    <section className="container-shell py-10 sm:py-16">
      {selected && showSuccess && <OrderSuccessModal coins={selected.coinsEarned} xp={selected.xpEarned} badges={selected.badges} onClose={() => setShowSuccess(false)} />}
      <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Orders</p>
      <h1 className="font-display mt-3 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>我的虚拟订单</h1>
      <div className="mt-8 grid gap-6 sm:gap-10 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          {orders.map((order) => (
            <button key={order.id} onClick={() => setSelectedId(order.id)} className={`w-full rounded-[1rem] border p-3.5 text-left transition sm:rounded-[1.25rem] sm:p-4 ${selected?.id === order.id ? "dopamine-panel border-transparent shadow-md" : "border-white/60 bg-white/85"}`}>
              <p className="font-display text-sm sm:text-base">{order.id}</p>
              <p className="mt-1 text-xs opacity-70">{formatDateTime(order.createdAt)} · {formatCurrency(order.total)}</p>
            </button>
          ))}
        </aside>
        {selected && <OrderDetail order={selected} onSign={() => signOrder(selected.id)} />}
      </div>
    </section>
    </PageTheme>
  );
}

function OrderDetail({ order, onSign }: { order: ReturnType<typeof useOrderStore.getState>["orders"][number]; onSign: () => void }) {
  const tracking = getTrackingProgress(order.createdAt, order.deliveryFlavor, new Date(), order.profile.deliveryCompletion ?? "never", order.profile.signedAt);
  const current = [...tracking].reverse().find((stage) => stage.reached) ?? tracking[0];
  return (
    <div className="rounded-[1rem] border border-white/60 bg-white/85 p-4 shadow-sm sm:rounded-[1.5rem] sm:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-5 sm:gap-6 sm:pb-6 md:flex-row md:items-start">
        <div><p className="text-xs" style={{ color: "var(--page-soft)" }}>订单编号</p><h2 className="font-display mt-1.5 break-all text-base leading-tight sm:text-lg" style={{ color: "var(--page-ink)" }}>{order.id}</h2><p className="mt-2 text-xs sm:mt-3 sm:text-sm" style={{ color: "var(--page-soft)" }}>当前状态：<span style={{ color: "var(--page-ink)" }}>{current.label}</span></p></div>
        <div className="dopamine-panel rounded-2xl p-4 sm:rounded-3xl sm:p-5"><p className="text-xs text-white/75">本单奖励</p><p className="font-display mt-1 text-xl sm:text-2xl">+{order.coinsEarned} 币</p><p className="text-xs text-white/75">+{order.xpEarned} XP</p></div>
      </div>
      {order.deliveryFlavor === "rider" && (
        <div className="dopamine-panel mt-4 rounded-2xl p-4 sm:mt-6 sm:rounded-3xl sm:p-5">
          <p className="font-display text-lg sm:text-xl">{current.label}</p>
          <p className="mt-1.5 text-xs text-white/80 sm:text-sm">骑手正在幻想路线中接近你，永远差一栋楼</p>
        </div>
      )}
      <div className="mt-5 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1fr]">
        <div><h3 className="font-display text-base sm:text-lg" style={{ color: "var(--page-ink)" }}>虚拟战利品</h3><div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">{order.items.map((item) => <div key={`${item.slug}-${JSON.stringify(item.options)}`} className="rounded-2xl border border-black/10 p-3 sm:p-3.5"><div className="flex justify-between gap-3"><div><p className="font-display text-sm sm:text-base" style={{ color: "var(--page-ink)" }}>{item.name}</p><p className="mt-0.5 text-xs" style={{ color: "var(--page-soft)" }}>{Object.values(item.options).join(" / ")} · ×{item.quantity}{item.giftWrap ? " · 礼品包装" : ""}</p></div><p className="text-sm" style={{ color: "var(--page-ink)" }}>{formatCurrency(item.price * item.quantity)}</p></div></div>)}</div><div className="mt-4 rounded-2xl border border-black/10 p-3.5 text-xs leading-6 sm:mt-5 sm:p-4 sm:text-sm sm:leading-7" style={{ color: "var(--page-soft)" }}><p>虚拟地址：{order.profile.virtualAddress}</p><p>优惠券：{order.profile.couponLabel ?? "未使用"}</p>{order.profile.note && <p>备注：{order.profile.note}</p>}{order.badges.length > 0 && <p>勋章：{order.badges.join("、")}</p>}</div></div>
        <div><h3 className="font-display text-base sm:text-lg" style={{ color: "var(--page-ink)" }}>物流追踪</h3><TrackingTimeline createdAt={order.createdAt} flavor={order.deliveryFlavor} completion={order.profile.deliveryCompletion ?? "never"} signedAt={order.profile.signedAt} />{(order.profile.deliveryCompletion ?? "never") === "signed" && !order.profile.signedAt && <Button className="mt-5 w-full" onClick={onSign}>一键签收</Button>}</div>
      </div>
    </div>
  );
}
