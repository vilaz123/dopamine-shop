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
  const [openId, setOpenId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const o = params.get("order");
    if (o) setOpenId(o);
    setShowSuccess(params.get("success") === "1");
  }, []);

  const openOrder = useMemo(() => orders.find((o) => o.id === openId) ?? null, [orders, openId]);

  if (orders.length === 0) {
    return (
      <PageTheme className="min-h-screen">
      <section className="container-shell py-10 sm:py-16">
        <div className="rounded-[1rem] border border-dashed border-black/15 bg-white p-6 text-center sm:rounded-[1.5rem] sm:p-10">
          <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Orders</p>
          <h1 className="font-display mt-3 text-xl sm:text-2xl" style={{ color: "var(--page-ink)" }}>还没有虚拟订单。</h1>
          <p className="mt-4 text-sm" style={{ color: "var(--page-soft)" }}>当购买欲出现时，可以先在 Dopahub 多巴胺仓下一单。</p>
          <ButtonLink href="/shop" className="mt-6">开始虚拟购物</ButtonLink>
        </div>
      </section>
      </PageTheme>
    );
  }

  return (
    <PageTheme className="min-h-screen">
    <section className="container-shell py-8 sm:py-14">
      {openOrder && showSuccess && <OrderSuccessModal coins={openOrder.coinsEarned} xp={openOrder.xpEarned} badges={openOrder.badges} onClose={() => setShowSuccess(false)} />}
      <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Orders</p>
      <h1 className="font-display mt-3 text-xl sm:text-2xl" style={{ color: "var(--page-ink)" }}>我的虚拟订单</h1>

      {/* 订单列表：单列，点一条弹抽屉 */}
      <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
        {orders.map((order) => {
          const tracking = getTrackingProgress(order.createdAt, order.deliveryFlavor, new Date(), order.profile.deliveryCompletion ?? "never", order.profile.signedAt);
          const current = [...tracking].reverse().find((s) => s.reached) ?? tracking[0];
          const isRider = order.deliveryFlavor === "rider";
          return (
            <button
              key={order.id}
              onClick={() => setOpenId(order.id)}
              className="flex w-full items-center gap-3 rounded-[1rem] border border-white/60 bg-white/85 p-3.5 text-left shadow-sm transition hover:border-[var(--hot)]/40 active:scale-[0.99] sm:rounded-[1.25rem] sm:p-4"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl" style={{ background: "color-mix(in srgb, var(--page-accent) 40%, white)" }}>{isRider ? "🛵" : "📦"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm sm:text-base" style={{ color: "var(--page-ink)" }}>{order.items[0]?.name}{order.items.length > 1 ? ` 等${order.items.length}件` : ""}</p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--page-soft)" }}>{formatDateTime(order.createdAt)} · {current.label}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-sm sm:text-base" style={{ color: "var(--page-ink)" }}>{formatCurrency(order.total)}</p>
                <p className="mt-0.5 text-[10px]" style={{ color: "var(--hot)" }}>+{order.coinsEarned} 币</p>
              </div>
            </button>
          );
        })}
      </div>
      </section>

      {/* 底部抽屉：订单详情 */}
      {openOrder && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setOpenId(null)} aria-hidden />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] slide-up">
            <div className="max-h-[90vh] overflow-y-auto rounded-t-[1.5rem] bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between rounded-t-[1.5rem] bg-white/95 px-4 py-3 backdrop-blur" style={{ borderBottom: "1px solid color-mix(in srgb, var(--page-accent) 50%, transparent)" }}>
                <p className="font-display text-sm" style={{ color: "var(--page-ink)" }}>订单详情</p>
                <button onClick={() => setOpenId(null)} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm" style={{ color: "var(--page-ink)" }}>关闭</button>
              </div>
              <div className="p-4 sm:p-5">
                <OrderDetail order={openOrder} onSign={() => signOrder(openOrder.id)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTheme>
  );
}

function OrderDetail({ order, onSign }: { order: ReturnType<typeof useOrderStore.getState>["orders"][number]; onSign: () => void }) {
  const tracking = getTrackingProgress(order.createdAt, order.deliveryFlavor, new Date(), order.profile.deliveryCompletion ?? "never", order.profile.signedAt);
  const current = [...tracking].reverse().find((stage) => stage.reached) ?? tracking[0];
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-5 sm:gap-6 sm:pb-6">
        <div><p className="text-xs" style={{ color: "var(--page-soft)" }}>订单编号</p><h2 className="font-display mt-1.5 break-all text-base leading-tight sm:text-lg" style={{ color: "var(--page-ink)" }}>{order.id}</h2><p className="mt-2 text-xs sm:text-sm" style={{ color: "var(--page-soft)" }}>当前状态：<span style={{ color: "var(--page-ink)" }}>{current.label}</span></p></div>
        <div className="dopamine-panel rounded-2xl p-4"><p className="text-xs text-white/75">本单奖励</p><p className="font-display mt-1 text-xl sm:text-2xl">+{order.coinsEarned} 币</p><p className="text-xs text-white/75">+{order.xpEarned} XP</p></div>
      </div>
      {order.deliveryFlavor === "rider" && (
        <div className="dopamine-panel mt-4 rounded-2xl p-4">
          <p className="font-display text-base sm:text-lg">{current.label}</p>
          <p className="mt-1.5 text-xs text-white/80 sm:text-sm">骑手正在幻想路线中接近你，永远差一栋楼</p>
        </div>
      )}
      <div className="mt-5 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1fr]">
        <div><h3 className="font-display text-base sm:text-lg" style={{ color: "var(--page-ink)" }}>虚拟战利品</h3><div className="mt-3 space-y-2.5 sm:space-y-3">{order.items.map((item) => <div key={`${item.slug}-${JSON.stringify(item.options)}`} className="rounded-2xl border border-black/10 p-3"><div className="flex justify-between gap-3"><div><p className="font-display text-sm sm:text-base" style={{ color: "var(--page-ink)" }}>{item.name}</p><p className="mt-0.5 text-xs" style={{ color: "var(--page-soft)" }}>{Object.values(item.options).join(" / ")} · ×{item.quantity}{item.giftWrap ? " · 礼品包装" : ""}</p></div><p className="text-sm" style={{ color: "var(--page-ink)" }}>{formatCurrency(item.price * item.quantity)}</p></div></div>)}</div><div className="mt-4 rounded-2xl border border-black/10 p-3.5 text-xs leading-6 sm:text-sm sm:leading-7" style={{ color: "var(--page-soft)" }}><p>虚拟地址：{order.profile.virtualAddress}</p><p>优惠券：{order.profile.couponLabel ?? "未使用"}</p>{order.profile.note && <p>备注：{order.profile.note}</p>}{order.badges.length > 0 && <p>勋章：{order.badges.join("、")}</p>}</div></div>
        <div><h3 className="font-display text-base sm:text-lg" style={{ color: "var(--page-ink)" }}>物流追踪</h3><TrackingTimeline createdAt={order.createdAt} flavor={order.deliveryFlavor} completion={order.profile.deliveryCompletion ?? "never"} signedAt={order.profile.signedAt} />{(order.profile.deliveryCompletion ?? "never") === "signed" && !order.profile.signedAt && <Button className="mt-5 w-full" onClick={onSign}>一键签收</Button>}</div>
      </div>
    </div>
  );
}
