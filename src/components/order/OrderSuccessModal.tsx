"use client";

import { Button } from "@/components/ui/Button";

export function OrderSuccessModal({ coins, xp, badges, onClose }: { coins: number; xp: number; badges: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4">
      <div className="relative max-w-lg overflow-hidden rounded-[2.5rem] bg-white p-8 text-center shadow-2xl">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,var(--hot),transparent_18%),radial-gradient(circle_at_80%_10%,var(--gold),transparent_18%),radial-gradient(circle_at_50%_90%,var(--success),transparent_18%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--hot)]">Order Created</p>
          <h2 className="font-display mt-3 text-6xl">下单成功！</h2>
          <p className="mt-4 text-[var(--muted)]">订单已生成，物流包裹正在进入永远派送中的快乐循环。</p>
          <div className="mt-6 rounded-3xl bg-black p-5 text-[var(--bone)]">
            <p className="font-display text-4xl">+{coins} 多巴胺币 · +{xp} XP</p>
            {badges.length > 0 && <p className="mt-2 text-sm text-white/70">解锁勋章：{badges.join("、")}</p>}
          </div>
          <Button className="mt-7 w-full" onClick={onClose}>查看物流包裹</Button>
        </div>
      </div>
    </div>
  );
}
