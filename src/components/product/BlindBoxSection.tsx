"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { blindSeries, drawRandomFigure, rarityMeta, figureImage, type BlindFigure, type BlindRarity, type BlindSeries } from "@/lib/data/blind-boxes";
import { assetUrl } from "@/lib/utils/image";
import { playShake, playTear, playReveal, setSfxMuted } from "@/lib/utils/sfx";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
import { useAssetStore } from "@/stores/asset-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/Button";

type Stage = "shake" | "tear" | "reveal";

/** 各稀有度对应的悬念时长（越稀有越拖）与粒子数。 */
const RARITY_DRAMA: Record<BlindRarity, { shakeMs: number; particles: number }> = {
  common: { shakeMs: 1400, particles: 18 },
  rare: { shakeMs: 1700, particles: 26 },
  "super-rare": { shakeMs: 2000, particles: 36 },
  hidden: { shakeMs: 2400, particles: 70 },
};

const SHAKE_HINTS = ["猜猜里面是…", "摇晃中…", "心跳加速…", "马上揭晓…"];

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

/** 飞溅粒子层：渲染一次性粒子后由 key 变化自清理。 */
function ConfettiBurst({ count, color, gold = false }: { count: number; color: string; gold?: boolean }) {
  const bits = useMemo(() => {
    const palette = gold ? ["#FFD23F", "#FFE680", "#FFAE42", "#fff7d6"] : [color, "#ffffff", "#ffd23f"];
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (i % 2 ? 0.3 : -0.3);
      const dist = 80 + ((i * 37) % 140);
      return {
        left: 50 + (Math.cos(angle) * 8),
        top: 50 + (Math.sin(angle) * 8),
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 30,
        r: ((i * 53) % 720) - 360,
        d: 0.7 + ((i * 17) % 70) / 100,
        c: palette[i % palette.length],
        s: 6 + (i % 4) * 3,
        round: i % 3 === 0,
      };
    });
  }, [count, color, gold]);
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible">
      {bits.map((b, i) => (
        <span
          key={i}
          className="blind-confetti absolute"
          style={
            {
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: b.s,
              height: b.round ? b.s : b.s * 0.5,
              background: b.c,
              borderRadius: b.round ? "9999px" : "2px",
              "--x": `${b.x}px`,
              "--y": `${b.y}px`,
              "--r": `${b.r}deg`,
              "--d": `${b.d}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** hidden 款金雨：从弹层顶部飘落。 */
function GoldRain({ count }: { count: number }) {
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 7 + (i % 3) * 4) % 100,
        d: 1.2 + ((i * 29) % 80) / 100,
        r: ((i * 53) % 540) - 270,
        s: 4 + (i % 3) * 2,
        c: ["#FFD23F", "#FFE680", "#fff7d6"][i % 3],
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {drops.map((d, i) => (
        <span
          key={i}
          className="blind-gold-rain absolute top-0"
          style={
            {
              left: `${d.left}%`,
              width: d.s,
              height: d.s * 1.6,
              background: d.c,
              borderRadius: "9999px",
              "--r": `${d.r}deg`,
              "--d": `${d.d}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function BlindBoxSection() {
  const [opening, setOpening] = useState<BlindSeries | null>(null);
  const [revealed, setRevealed] = useState<BlindFigure | null>(null);
  const [stage, setStage] = useState<Stage>("shake");
  const [hintIdx, setHintIdx] = useState(0);
  const [flash, setFlash] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const grantCoins = useAssetStore((s) => s.grantCoins);
  const grantXp = useAssetStore((s) => s.grantXp);
  const setLastReward = useUiStore((s) => s.setLastReward);
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const setSoundEnabled = useUiStore((s) => s.setSoundEnabled);

  // 同步静音状态到 sfx 模块。
  useEffect(() => {
    setSfxMuted(!soundEnabled);
  }, [soundEnabled]);

  // 组件卸载时清掉所有挂起的计时器，避免 setState 到已卸载组件。
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const pushTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  function close() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setOpening(null);
    setRevealed(null);
    setStage("shake");
    setFlash(false);
  }

  function open(series: BlindSeries) {
    setOpening(series);
    setRevealed(null);
    setStage("shake");
    setHintIdx(0);
    // 虚拟扣款为 0，只奖励。
    const figure = drawRandomFigure(series);
    const drama = RARITY_DRAMA[figure.rarity];

    playShake();
    // 摇晃阶段轮播文案。
    let h = 0;
    pushTimer(() => setHintIdx((h = (h + 1) % SHAKE_HINTS.length)), 380);
    pushTimer(() => setHintIdx((h = (h + 1) % SHAKE_HINTS.length)), 760);
    pushTimer(() => setHintIdx((h = (h + 1) % SHAKE_HINTS.length)), 1140);

    // 进入撕开阶段。
    pushTimer(() => {
      setStage("tear");
      setFlash(true);
      playTear();
      pushTimer(() => setFlash(false), 360);
    }, drama.shakeMs);

    // 揭晓。
    pushTimer(() => {
      setStage("reveal");
      setRevealed(figure);
      playReveal(figure.rarity);
      const coins = figure.rarity === "hidden" ? 88 : figure.rarity === "super-rare" ? 48 : figure.rarity === "rare" ? 24 : 12;
      const xp = figure.rarity === "hidden" ? 60 : figure.rarity === "super-rare" ? 30 : figure.rarity === "rare" ? 15 : 8;
      grantCoins(coins);
      grantXp(xp);
      setLastReward({ id: `blind-${Date.now()}`, coins, xp, badge: figure.rarity === "hidden" ? `${figure.name}（隐藏款）` : undefined });
    }, drama.shakeMs + 360);
  }

  const isHidden = revealed?.rarity === "hidden";

  return (
    <section className="mt-12 rounded-[1.5rem] border border-[var(--hot)]/20 bg-[color-mix(in_srgb,var(--hot)_6%,white)] p-5 backdrop-blur sm:mt-16 sm:rounded-[2.5rem] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--hot)]">Blind Box</p>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>潮玩盲盒 · 虚拟开盒</h2>
          <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">致敬泡泡玛特/Skullpanda/Dimoo。每盒随机一只，隐藏款概率 2%。重复款焦虑删除，开盒快感 100%。</p>
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
          <BoxCard key={s.slug} series={s} onOpen={open} />
        ))}
      </div>

      {/* 开盒揭晓弹层 */}
      {opening && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => stage === "reveal" && close()}
        >
          {/* 撕开瞬间的全屏白闪 */}
          {flash && <div className="blind-tear-flash pointer-events-none absolute inset-0 bg-white" />}

          <div
            className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {stage === "shake" && (
              <>
                <div className="relative mx-auto grid h-32 w-32 place-items-center">
                  <div
                    className="blind-halo absolute inset-0 rounded-full"
                    style={{ background: `radial-gradient(circle, ${opening.accent}55, transparent 70%)` }}
                  />
                  <div
                    className="blind-shake grid h-28 w-28 place-items-center rounded-3xl text-6xl"
                    style={{ background: `linear-gradient(135deg, ${opening.saturation}, ${opening.accent})` }}
                  >
                    🎁
                  </div>
                </div>
                <p className="font-display mt-6 text-2xl">{SHAKE_HINTS[hintIdx]}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">盲盒正在打开</p>
              </>
            )}

            {stage === "tear" && (
              <div className="relative mx-auto grid h-40 w-40 place-items-center">
                <div
                  className="blind-rays absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, ${opening.accent} 20deg, transparent 40deg, ${opening.accent} 60deg, transparent 80deg, ${opening.accent} 100deg, transparent 120deg, ${opening.accent} 140deg, transparent 160deg, ${opening.accent} 180deg, transparent 200deg, ${opening.accent} 220deg, transparent 240deg, ${opening.accent} 260deg, transparent 280deg, ${opening.accent} 300deg, transparent 320deg, ${opening.accent} 340deg, transparent 360deg)`,
                    opacity: 0.5,
                  }}
                />
                <div
                  className="blind-burst grid h-28 w-28 place-items-center rounded-3xl text-6xl"
                  style={{ background: `linear-gradient(135deg, ${opening.saturation}, ${opening.accent})` }}
                >
                  🎁
                </div>
              </div>
            )}

            {stage === "reveal" && revealed && (
              <>
                {isHidden && (
                  <>
                    <div className="blind-gold-glow pointer-events-none absolute inset-0 rounded-[2rem]" style={{ background: "radial-gradient(circle, var(--gold), transparent 70%)" }} />
                    <GoldRain count={40} />
                  </>
                )}
                <ConfettiBurst count={RARITY_DRAMA[revealed.rarity].particles} color={rarityMeta[revealed.rarity].color} gold={isHidden} />
                <div className="relative mx-auto grid h-40 w-40 place-items-center overflow-hidden rounded-3xl">
                  <div
                    className="blind-aura absolute inset-[-20%] rounded-full"
                    style={{ background: `radial-gradient(circle, ${revealed.accent}, transparent 65%)` }}
                  />
                  <div className="blind-reveal-in h-full w-full" style={{ boxShadow: `0 0 60px ${revealed.accent}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${BASE_PATH}${assetUrl(figureImage(opening.slug, revealed.id))}`} alt={revealed.name} className="h-full w-full rounded-3xl object-cover" />
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: rarityMeta[revealed.rarity].color }}>
                  {rarityMeta[revealed.rarity].label}
                </p>
                <p className={`font-display mt-2 text-3xl ${isHidden ? "blind-legend-pop" : ""}`} style={isHidden ? { color: "var(--gold)" } : undefined}>
                  {revealed.name}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {revealed.rarity === "hidden" ? "🎉 隐藏款！传说级运气" : revealed.rarity === "super-rare" ? "✨ 超稀有！" : "已收入虚拟展柜"}
                </p>
                <Button className="mt-6 w-full" onClick={close}>再来一盒</Button>
              </>
            )}

            <button
              className="absolute right-4 top-4 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
              onClick={close}
              aria-label="关闭开盒"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
