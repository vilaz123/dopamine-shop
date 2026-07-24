"use client";

import { useEffect, useState } from "react";
import { blindSeries, rarityMeta, type BlindSeries } from "@/lib/data/blind-boxes";
import { setSfxMuted } from "@/lib/utils/sfx";
import { BlindBoxOpener } from "@/components/blindbox/BlindBoxOpener";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/Button";

function BoxCard({ series, onOpen }: { series: BlindSeries; onOpen: (s: BlindSeries) => void }) {
  return (
    <div className="rounded-[1.25rem] border border-black/10 bg-white/70 p-4 backdrop-blur sm:rounded-[2rem] sm:p-5" style={{ boxShadow: `0 12px 40px ${series.accent}22` }}>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `linear-gradient(135deg, ${series.saturation}, ${series.accent})` }}>
          🎁
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--hot)]">{series.brand}</p>
          <h3 className="font-display mt-1 text-xl leading-tight sm:text-2xl">{series.name}</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)] sm:text-sm">{series.subtitle} · ¥{series.price}/盒</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{series.story}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Object.entries(rarityMeta).map(([key, m]) => (
          <span key={key} className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ background: m.color }}>
            {m.label} {(m.rate * 100).toFixed(0)}%
          </span>
        ))}
      </div>
      <Button className="mt-4 w-full" onClick={() => onOpen(series)}>开盒 · ¥{series.price}</Button>
    </div>
  );
}

/**
 * 盲盒区（简版列表 + 开盒仪式）。展示柜版本见 BlindShowcase（用于 /blindbox）。
 * 开盒仪式逻辑统一在 BlindBoxOpener。
 */
export function BlindBoxSection() {
  const [opening, setOpening] = useState<BlindSeries | null>(null);
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const setSoundEnabled = useUiStore((s) => s.setSoundEnabled);

  useEffect(() => {
    setSfxMuted(!soundEnabled);
  }, [soundEnabled]);

  return (
    <section className="mt-10 rounded-[1.5rem] border border-[var(--hot)]/20 bg-[color-mix(in_srgb,var(--hot)_6%,white)] p-4 backdrop-blur sm:mt-16 sm:rounded-[2.5rem] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--hot)]">Blind Box</p>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>潮玩盲盒 · 虚拟开盒</h2>
          <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">致敬泡泡玛特/Skullpanda/Dimoo/Labubu/小野/PUCKY。每盒随机一只，隐藏款概率 2%。重复款焦虑删除，开盒快感 100%。</p>
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
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {blindSeries.map((s) => (
          <BoxCard key={s.slug} series={s} onOpen={setOpening} />
        ))}
      </div>

      <BlindBoxOpener series={opening} onClose={() => setOpening(null)} />
    </section>
  );
}
