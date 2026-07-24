"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { drawRandomFigure, rarityMeta, figureImage, type BlindFigure, type BlindRarity, type BlindSeries } from "@/lib/data/blind-boxes";
import { assetUrl } from "@/lib/utils/image";
import { playShake, playTear, playReveal } from "@/lib/utils/sfx";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
import { useAssetStore } from "@/stores/asset-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/Button";

type Stage = "shake" | "tear" | "reveal";

/** 各稀有度对应的悬念时长（越稀有越拖）与粒子数。 */
export const RARITY_DRAMA: Record<BlindRarity, { shakeMs: number; particles: number }> = {
  common: { shakeMs: 1400, particles: 18 },
  rare: { shakeMs: 1700, particles: 26 },
  "super-rare": { shakeMs: 2000, particles: 36 },
  hidden: { shakeMs: 2400, particles: 70 },
};

const SHAKE_HINTS = ["猜猜里面是…", "摇晃中…", "心跳加速…", "马上揭晓…"];

/** 飞溅粒子层：渲染一次性粒子后由 key 变化自清理。 */
function ConfettiBurst({ count, color, gold = false }: { count: number; color: string; gold?: boolean }) {
  const bits = useMemo(() => {
    const palette = gold ? ["#FFD23F", "#FFE680", "#FFAE42", "#fff7d6"] : [color, "#ffffff", "#ffd23f"];
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (i % 2 ? 0.3 : -0.3);
      const dist = 80 + ((i * 37) % 140);
      return {
        left: 50 + Math.cos(angle) * 8,
        top: 50 + Math.sin(angle) * 8,
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

/**
 * 开盒揭晓弹层（三阶段仪式 + 粒子 + 合成音效）。可复用：传入 series 即开盒，
 * 抽中后在揭晓阶段可点遮罩/✕ 关闭，由父组件把 series 置 null 卸载。
 * 静音状态由各宿主页统一 setSfxMuted 控制（见 BlindBoxSection/BlindShowcase）。
 */
export function BlindBoxOpener({ series, onClose }: { series: BlindSeries | null; onClose: () => void }) {
  const [revealed, setRevealed] = useState<BlindFigure | null>(null);
  const [stage, setStage] = useState<Stage>("shake");
  const [hintIdx, setHintIdx] = useState(0);
  const [flash, setFlash] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const grantCoins = useAssetStore((s) => s.grantCoins);
  const grantXp = useAssetStore((s) => s.grantXp);
  const setLastReward = useUiStore((s) => s.setLastReward);

  // 弹层打开时锁定背景滚动（含 iOS 动态地址栏），避免双滚动/弹层错位。
  useEffect(() => {
    if (!series) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [series]);

  // 卸载时清掉所有挂起的计时器。
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
    onClose();
  }

  // series 变化即触发一次开盒流程。
  useEffect(() => {
    if (!series) {
      setRevealed(null);
      setStage("shake");
      setFlash(false);
      return;
    }
    setRevealed(null);
    setStage("shake");
    setHintIdx(0);
    const figure = drawRandomFigure(series);
    const drama = RARITY_DRAMA[figure.rarity];

    playShake();
    let h = 0;
    pushTimer(() => setHintIdx((h = (h + 1) % SHAKE_HINTS.length)), 380);
    pushTimer(() => setHintIdx((h = (h + 1) % SHAKE_HINTS.length)), 760);
    pushTimer(() => setHintIdx((h = (h + 1) % SHAKE_HINTS.length)), 1140);

    pushTimer(() => {
      setStage("tear");
      setFlash(true);
      playTear();
      pushTimer(() => setFlash(false), 360);
    }, drama.shakeMs);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series]);

  if (!series) return null;

  const isHidden = revealed?.rarity === "hidden";

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden bg-black/60 backdrop-blur-sm">
      {/* 遮罩点击：仅在揭晓后允许关闭，摇晃/撕开阶段不中断 */}
      <button
        type="button"
        aria-label="关闭开盒遮罩"
        className="absolute inset-0 cursor-default"
        onClick={() => stage === "reveal" && close()}
      />
      {/* 撕开瞬间的全屏白闪 */}
      {flash && <div className="blind-tear-flash pointer-events-none absolute inset-0 bg-white" />}

      {/* 滚动容器：矮内容居中（my-auto），高内容从顶部可见且可纵向滚动；
          外层 overflow-hidden 裁掉飞出视口的粒子，避免横向划屏 */}
      <div className="absolute inset-0 flex justify-center overflow-y-auto overflow-x-hidden p-4">
        <div className="relative my-auto w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl sm:p-8">
          {stage === "shake" && (
            <>
              <div className="relative mx-auto grid h-32 w-32 place-items-center">
                <div
                  className="blind-halo absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, ${series.accent}55, transparent 70%)` }}
                />
                <div
                  className="blind-shake grid h-28 w-28 place-items-center rounded-3xl text-6xl"
                  style={{ background: `linear-gradient(135deg, ${series.saturation}, ${series.accent})` }}
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
                  background: `conic-gradient(from 0deg, transparent 0deg, ${series.accent} 20deg, transparent 40deg, ${series.accent} 60deg, transparent 80deg, ${series.accent} 100deg, transparent 120deg, ${series.accent} 140deg, transparent 160deg, ${series.accent} 180deg, transparent 200deg, ${series.accent} 220deg, transparent 240deg, ${series.accent} 260deg, transparent 280deg, ${series.accent} 300deg, transparent 320deg, ${series.accent} 340deg, transparent 360deg)`,
                  opacity: 0.5,
                }}
              />
              <div
                className="blind-burst grid h-28 w-28 place-items-center rounded-3xl text-6xl"
                style={{ background: `linear-gradient(135deg, ${series.saturation}, ${series.accent})` }}
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
                  <img src={`${BASE_PATH}${assetUrl(figureImage(series.slug, revealed.id))}`} alt={revealed.name} className="h-full w-full rounded-3xl object-cover" />
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
    </div>
  );
}
