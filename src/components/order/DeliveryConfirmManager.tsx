"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/stores/order-store";
import { useAvatarStore } from "@/stores/avatar-store";
import { useAssetStore } from "@/stores/asset-store";
import { useUiStore } from "@/stores/ui-store";
import { getProduct } from "@/lib/data/products";
import { isFeedable } from "@/lib/data/avatar-calories";
import { playPop } from "@/lib/utils/sfx";
import { Button } from "@/components/ui/Button";

/**
 * 全局收货确认管理器：常驻监听 order-store.pendingDeliveries，
 * 到 deliverAt 时间弹「虚拟订单到了」确认窗；食物订单确认后问是否喂分身。
 * 挂在 layout（同 RewardFlash/FlyToCart），不绑死在 checkout（下单后已跳走）。
 */
export function DeliveryConfirmManager() {
  const router = useRouter();
  const pending = useOrderStore((s) => s.pendingDeliveries);
  const confirmDelivery = useOrderStore((s) => s.confirmDelivery);
  const signOrder = useOrderStore((s) => s.signOrder);
  const avatar = useAvatarStore((s) => s);
  const feed = useAvatarStore((s) => s.feed);
  const triggerFly = useUiStore((s) => s.triggerFly);
  const setLastReward = useUiStore((s) => s.setLastReward);
  const [current, setCurrent] = useState<string | null>(null);
  const [step, setStep] = useState<"deliver" | "feed" | "done">("deliver");

  // 每秒检查是否有到点的待收货
  useEffect(() => {
    const t = setInterval(() => {
      if (current) return;
      const now = Date.now();
      const due = pending.find((p) => new Date(p.deliverAt).getTime() <= now);
      if (due) {
        setCurrent(due.orderId);
        setStep("deliver");
      }
    }, 1000);
    return () => clearInterval(t);
  }, [pending, current]);

  if (!current) return null;
  const delivery = pending.find((p) => p.orderId === current);
  if (!delivery) {
    setCurrent(null);
    return null;
  }

  const foodItems = delivery.items.filter((it) => it.category === "food-delivery" || it.category === "snacks");
  const hasFood = foodItems.length > 0;

  function confirm() {
    signOrder(current!);
    confirmDelivery(current!);
    if (hasFood && avatar.created) {
      setStep("feed");
    } else {
      setCurrent(null);
      setStep("deliver");
    }
  }

  function doFeed(btn: HTMLButtonElement) {
    let coins = 0;
    for (const it of foodItems) {
      const p = getProduct(it.slug);
      if (!p || !isFeedable(p)) continue;
      feed(p); // 每件喂一次
      coins += 2;
    }
    useAssetStore.getState().grantCoins(coins);
    setLastReward({ id: `feed-delivery-${Date.now()}`, coins });
    playPop();
    const r = btn.getBoundingClientRect();
    triggerFly({ fromX: r.left + r.width / 2, fromY: r.top + r.height / 2, coins, color: "var(--gold)" });
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => { confirmDelivery(current!); setCurrent(null); setStep("deliver"); }} aria-hidden />
      <div className="relative w-full max-w-md slide-up sm:mx-auto">
        <div className="rounded-t-[1.5rem] bg-white p-6 shadow-2xl sm:rounded-[1.5rem]" style={{ color: "var(--page-ink)" }}>
          {step === "deliver" && (
            <>
              <h3 className="font-display flex items-center gap-2 text-xl"><span className="text-2xl">📦</span>你的虚拟订单到了！</h3>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--page-soft)" }}>骑手（幻想中的）历经一分钟终于送达。确认收货后这单才算真正落地——当然，永不真实签收。</p>
              <div className="mt-4 space-y-1.5">
                {delivery.items.map((it) => (
                  <div key={it.slug} className="flex items-center justify-between rounded-2xl bg-[color-mix(in_srgb,var(--page-accent)_15%,white)] px-3 py-2 text-sm">
                    <span>{it.name}</span>
                    <span className="text-xs" style={{ color: "var(--page-soft)" }}>×{it.quantity}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-5 w-full" onClick={confirm}>确认收货</Button>
            </>
          )}
          {step === "feed" && (
            <>
              <h3 className="font-display flex items-center gap-2 text-xl"><span className="text-2xl">🍽️</span>喂给分身吗？</h3>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--page-soft)" }}>这单里有食物，可以喂给你的分身 <b>{avatar.name}</b>——它会变饱、累计卡路里，形体也会变。当然也可以先收着，去分身页再喂。</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {foodItems.map((it) => (
                  <span key={it.slug} className="rounded-full bg-[color-mix(in_srgb,var(--hot)_15%,white)] px-3 py-1 text-xs" style={{ color: "var(--page-ink)" }}>{it.name} ×{it.quantity}</span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <Button onClick={(e) => doFeed(e.currentTarget)}>喂给分身</Button>
                <Button variant="ghost" onClick={() => { setCurrent(null); setStep("deliver"); }}>先收着</Button>
              </div>
            </>
          )}
          {step === "done" && (
            <>
              <h3 className="font-display flex items-center gap-2 text-xl"><span className="text-2xl">🐷</span>喂饱啦！</h3>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--page-soft)" }}>{avatar.name} 欢喜地吃下了，卡路里已落到它身上。去看看它现在的样子？</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <Button onClick={() => { router.push("/avatar"); setCurrent(null); setStep("deliver"); }}>看分身</Button>
                <Button variant="ghost" onClick={() => { setCurrent(null); setStep("deliver"); }}>关闭</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
