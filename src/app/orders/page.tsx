"use client";

import { useEffect, useMemo, useState } from "react";
import { useOrderStore } from "@/stores/order-store";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { getTrackingProgress } from "@/lib/tracking/stages";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TrackingTimeline } from "@/components/order/TrackingTimeline";
import { OrderSuccessModal } from "@/components/order/OrderSuccessModal";

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
      <section className="container-shell py-16">
        <div className="rounded-[2.5rem] border border-dashed border-black/15 bg-[#fffaf2] p-12 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">Orders</p>
          <h1 className="font-display mt-4 text-6xl">还没有虚拟订单。</h1>
          <p className="mt-5 text-[#7a7167]">当购买欲出现时，可以先在 Dopahub 多巴胺仓下一单。</p>
          <ButtonLink href="/shop" className="mt-8">开始虚拟购物</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell py-16">
      {selected && showSuccess && <OrderSuccessModal coins={selected.coinsEarned} xp={selected.xpEarned} badges={selected.badges} onClose={() => setShowSuccess(false)} />}
      <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">Orders</p>
      <h1 className="font-display mt-4 text-6xl">我的虚拟订单</h1>
      <div className="mt-12 grid gap-10 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          {orders.map((order) => (
            <button key={order.id} onClick={() => setSelectedId(order.id)} className={`w-full rounded-[1.5rem] border p-5 text-left transition ${selected?.id === order.id ? "border-black bg-[#0b0b0b] text-[#f6f1e8]" : "border-black/10 bg-[#fffaf2]"}`}>
              <p className="font-display text-2xl">{order.id}</p>
              <p className="mt-2 text-sm opacity-70">{formatDateTime(order.createdAt)} · {formatCurrency(order.total)}</p>
            </button>
          ))}
        </aside>
        {selected && <OrderDetail order={selected} onSign={() => signOrder(selected.id)} />}
      </div>
    </section>
  );
}

function OrderDetail({ order, onSign }: { order: ReturnType<typeof useOrderStore.getState>["orders"][number]; onSign: () => void }) {
  const tracking = getTrackingProgress(order.createdAt, order.deliveryFlavor, new Date(), order.profile.deliveryCompletion ?? "never", order.profile.signedAt);
  const current = [...tracking].reverse().find((stage) => stage.reached) ?? tracking[0];
  return (
    <div className="rounded-[2.5rem] bg-[#fffaf2] p-8">
      <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-8 md:flex-row md:items-start">
        <div><p className="text-sm text-[#7a7167]">订单编号</p><h2 className="font-display mt-2 text-5xl">{order.id}</h2><p className="mt-4 text-[#7a7167]">当前状态：<span className="text-black">{current.label}</span></p></div>
        <div className="rounded-3xl bg-[#0b0b0b] p-6 text-[#f6f1e8]"><p className="text-sm text-white/60">本单奖励</p><p className="font-display mt-2 text-4xl">+{order.coinsEarned} 币</p><p className="text-sm text-white/60">+{order.xpEarned} XP</p></div>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div><h3 className="font-display text-4xl">虚拟战利品</h3><div className="mt-5 space-y-4">{order.items.map((item) => <div key={`${item.slug}-${JSON.stringify(item.options)}`} className="rounded-2xl border border-black/10 p-4"><div className="flex justify-between gap-4"><div><p className="font-display text-2xl">{item.name}</p><p className="text-sm text-[#7a7167]">{Object.values(item.options).join(" / ")} · ×{item.quantity}{item.giftWrap ? " · 礼品包装" : ""}</p></div><p>{formatCurrency(item.price * item.quantity)}</p></div></div>)}</div><div className="mt-8 rounded-2xl border border-black/10 p-5 text-sm leading-7 text-[#554c43]"><p>虚拟地址：{order.profile.virtualAddress}</p><p>优惠券：{order.profile.couponLabel ?? "未使用"}</p>{order.profile.note && <p>备注：{order.profile.note}</p>}{order.badges.length > 0 && <p>勋章：{order.badges.join("、")}</p>}</div></div>
        <div><h3 className="font-display text-4xl">物流追踪</h3><TrackingTimeline createdAt={order.createdAt} flavor={order.deliveryFlavor} completion={order.profile.deliveryCompletion ?? "never"} signedAt={order.profile.signedAt} />{(order.profile.deliveryCompletion ?? "never") === "signed" && !order.profile.signedAt && <Button className="mt-5 w-full" onClick={onSign}>一键签收</Button>}</div>
      </div>
    </div>
  );
}
