"use client";

import { useEffect } from "react";
import { BlindShowcase } from "@/components/blindbox/BlindShowcase";
import { setSfxMuted } from "@/lib/utils/sfx";
import { useUiStore } from "@/stores/ui-store";

export default function BlindBoxPage() {
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const setSoundEnabled = useUiStore((s) => s.setSoundEnabled);

  useEffect(() => {
    setSfxMuted(!soundEnabled);
  }, [soundEnabled]);

  return (
    <section className="theme-home relative overflow-hidden">
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />
      <div className="container-shell py-10 sm:py-16">
        {/* Hero */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>
              🎲 Blind Box Casino
            </p>
            <h1 className="font-display mt-3 text-3xl leading-tight sm:text-5xl" style={{ color: "var(--page-ink)" }}>
              赌一把盲盒
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8" style={{ color: "var(--page-soft)" }}>
              赌赢了是快乐，赌输了是数字。每个系列随机一只，隐藏款概率 2%，开出即传说。重复款焦虑删除，开盒快感 100%——而且，一分钱真不扣。
            </p>
          </div>
          <button
            type="button"
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "关闭开盒音效" : "开启开盒音效"}
            title={soundEnabled ? "音效已开" : "音效已关"}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="shrink-0 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-lg leading-none transition hover:border-[var(--hot)]/40"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>

        {/* 轮转展示柜 */}
        <div className="mt-10 sm:mt-12">
          <BlindShowcase />
        </div>

        {/* 免责 */}
        <div className="mt-12 rounded-[1.5rem] border border-black/10 bg-white/60 p-5 backdrop-blur sm:rounded-[2rem] sm:p-6">
          <p className="text-sm leading-7" style={{ color: "var(--page-soft)" }}>
            🎁 本区所有盲盒均为<span className="font-semibold" style={{ color: "var(--page-ink)" }}>虚拟开盒</span>：抽中的款式、奖励的多巴胺币只存在于本站的虚拟展柜，不会真实扣款、不会真实发货。致意泡泡玛特 / Skullpanda / Dimoo / Labubu / 小野 / PUCKY 等潮玩风格，非真实 IP。赌，请止于本站。
          </p>
        </div>
      </div>
    </section>
  );
}
