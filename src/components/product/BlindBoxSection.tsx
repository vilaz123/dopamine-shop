"use client";

import { useState } from "react";
import { blindSeries, drawRandomFigure, rarityMeta, figureImage, type BlindFigure, type BlindSeries } from "@/lib/data/blind-boxes";
import { assetUrl } from "@/lib/utils/image";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
import { useAssetStore } from "@/stores/asset-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/Button";

function BoxCard({ series, onOpen }: { series: BlindSeries; onOpen: (s: BlindSeries) => void }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white/70 p-5 backdrop-blur sm:rounded-[2rem]" style={{ boxShadow: `0 12px 40px ${series.accent}22` }}>
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

export function BlindBoxSection() {
  const [opening, setOpening] = useState<BlindSeries | null>(null);
  const [revealed, setRevealed] = useState<BlindFigure | null>(null);
  const [spinning, setSpinning] = useState(false);
  const grantCoins = useAssetStore((s) => s.grantCoins);
  const grantXp = useAssetStore((s) => s.grantXp);
  const setLastReward = useUiStore((s) => s.setLastReward);

  function open(series: BlindSeries) {
    setOpening(series);
    setRevealed(null);
    setSpinning(true);
    grantCoins(-series.price < 0 ? 0 : 0); // 虚拟扣款为0，只奖励
    // 抽取 + 延迟揭晓（摇晃动画）
    const figure = drawRandomFigure(series);
    setTimeout(() => {
      setRevealed(figure);
      setSpinning(false);
      const coins = figure.rarity === "hidden" ? 88 : figure.rarity === "super-rare" ? 48 : figure.rarity === "rare" ? 24 : 12;
      const xp = figure.rarity === "hidden" ? 60 : figure.rarity === "super-rare" ? 30 : figure.rarity === "rare" ? 15 : 8;
      grantCoins(coins);
      grantXp(xp);
      setLastReward({ id: `blind-${Date.now()}`, coins, xp, badge: figure.rarity === "hidden" ? `${figure.name}（隐藏款）` : undefined });
    }, 1600);
  }

  return (
    <section className="mt-12 rounded-[1.5rem] border border-[var(--hot)]/20 bg-[color-mix(in_srgb,var(--hot)_6%,white)] p-5 backdrop-blur sm:mt-16 sm:rounded-[2.5rem] sm:p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--hot)]">Blind Box</p>
      <h2 className="font-display mt-2 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>潮玩盲盒 · 虚拟开盒</h2>
      <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">致敬泡泡玛特/Skullpanda/Dimoo。每盒随机一只，隐藏款概率 2%。重复款焦虑删除，开盒快感 100%。</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {blindSeries.map((s) => (
          <BoxCard key={s.slug} series={s} onOpen={open} />
        ))}
      </div>

      {/* 开盒揭晓弹层 */}
      {opening && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => !spinning && (setOpening(null), setRevealed(null))}>
          <div className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {spinning && !revealed ? (
              <>
                <div className="mx-auto grid h-32 w-32 animate-bounce place-items-center rounded-3xl text-6xl" style={{ background: `linear-gradient(135deg, ${opening.saturation}, ${opening.accent})` }}>🎁</div>
                <p className="font-display mt-6 text-2xl">摇晃中…</p>
                <p className="mt-2 text-sm text-[var(--muted)]">盲盒正在打开</p>
              </>
            ) : revealed ? (
              <>
                <div className="mx-auto grid h-40 w-40 place-items-center overflow-hidden rounded-3xl shadow-lg" style={{ background: `linear-gradient(135deg, ${revealed.accent}, ${opening.accent})`, boxShadow: `0 0 60px ${revealed.accent}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${BASE_PATH}${assetUrl(figureImage(opening.slug, revealed.id))}`} alt={revealed.name} className="h-full w-full object-cover" />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: rarityMeta[revealed.rarity].color }}>{rarityMeta[revealed.rarity].label}</p>
                <p className="font-display mt-2 text-3xl">{revealed.name}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{revealed.rarity === "hidden" ? "🎉 隐藏款！传说级运气" : revealed.rarity === "super-rare" ? "✨ 超稀有！" : "已收入虚拟展柜"}</p>
                <Button className="mt-6 w-full" onClick={() => { setOpening(null); setRevealed(null); }}>再来一盒</Button>
              </>
            ) : null}
            {!spinning && <button className="absolute right-4 top-4 text-sm text-[var(--muted)]" onClick={() => { setOpening(null); setRevealed(null); }}>✕</button>}
          </div>
        </div>
      )}
    </section>
  );
}
