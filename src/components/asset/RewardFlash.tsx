"use client";

import { useEffect, useState } from "react";
import { useUiStore } from "@/stores/ui-store";

export function RewardFlash() {
  const reward = useUiStore((state) => state.lastReward);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!reward) return;
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      setLastReward(null);
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [reward, setLastReward]);

  if (!reward || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[70] flex justify-center px-4">
      <div className="reward-flash rounded-full border border-yellow-300/60 bg-[var(--ink)] px-7 py-4 text-center text-[var(--bone)] shadow-2xl">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--gold)]">Reward Unlocked</p>
        <p className="font-display mt-1 text-3xl">+{reward.coins} 多巴胺币{reward.xp ? ` · +${reward.xp} XP` : ""}</p>
        {reward.badge && <p className="mt-1 text-sm text-white/70">解锁勋章：{reward.badge}</p>}
      </div>
    </div>
  );
}
