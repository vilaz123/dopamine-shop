"use client";

import { useState } from "react";
import { useAssetStore } from "@/stores/asset-store";
import { useUiStore } from "@/stores/ui-store";

type Promo = {
  tag: string;
  text: string;
  hint: string;
  kind: "coupon" | "coins";
  code?: string;
  coins?: number;
};

const promos: Promo[] = [
  { tag: "满减", text: "虚拟满 99 减 30", hint: "点击领取外卖专区券", kind: "coupon", code: "FEAST" },
  { tag: "赔付", text: "超时赔付 +20 多巴胺币", hint: "点击领取多巴胺币", kind: "coins", coins: 20 },
  { tag: "新人", text: "新人外卖券", hint: "点击领取新人券", kind: "coupon", code: "TAKEAWAYNEW" },
  { tag: "免运", text: "今日免配送费", hint: "点击领取免配送费券", kind: "coupon", code: "FREEDELIVERY" },
];

export function TakeawayPromoBanner() {
  const addCoupon = useAssetStore((state) => state.addCoupon);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const ownedCoupons = useAssetStore((state) => state.coupons);
  const [claimedCoins, setClaimedCoins] = useState(false);

  function isClaimed(promo: Promo) {
    if (promo.kind === "coins") return claimedCoins;
    return promo.code ? ownedCoupons.some((coupon) => coupon.code === promo.code) : false;
  }

  function claim(promo: Promo) {
    if (isClaimed(promo)) return;
    if (promo.kind === "coupon" && promo.code) {
      addCoupon(promo.code);
    } else if (promo.kind === "coins" && promo.coins) {
      grantCoins(promo.coins);
      setLastReward({ id: `promo-coins-${Date.now()}`, coins: promo.coins });
      setClaimedCoins(true);
    }
  }

  return (
    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {promos.map((promo) => {
        const done = isClaimed(promo);
        return (
          <button
            key={promo.tag}
            onClick={() => claim(promo)}
            disabled={done}
            className={`flex min-w-[78vw] snap-start flex-col gap-1 rounded-2xl border p-4 text-left transition sm:min-w-[220px] ${done ? "cursor-default border-black/10 bg-white opacity-60" : "border-yellow-400/40 bg-yellow-400/15 hover:border-yellow-400/80 hover:bg-yellow-400/25"}`}
          >
            <span className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--hot)]">{promo.tag}</span>
              {done && <span className="text-xs text-[var(--success)]">已领取 ✓</span>}
            </span>
            <span className="font-display text-xl sm:text-2xl">{promo.text}</span>
            <span className="text-xs text-[var(--muted)]">{done ? "已放进你的虚拟券包" : promo.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
