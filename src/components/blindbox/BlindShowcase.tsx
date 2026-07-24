"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { blindSeries, rarityMeta, figureImage, type BlindSeries } from "@/lib/data/blind-boxes";
import { thumbUrl } from "@/lib/utils/image";
import { useInView } from "@/lib/utils/useInView";
import { BlindBoxOpener } from "./BlindBoxOpener";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const CAROUSEL_MS = 2600;

function RarityBars({ active }: { active: boolean }) {
  // 进视口后概率条从 0 涨到目标百分比。
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!active) {
      setP(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      setP(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return (
    <div className="mt-4 space-y-2">
      {Object.entries(rarityMeta).map(([key, m]) => (
        <div key={key} className="flex items-center gap-2 text-xs" style={{ color: "var(--page-ink)" }}>
          <span className="w-14 shrink-0 font-semibold" style={{ color: m.color }}>
            {m.label}
          </span>
          <span className="relative h-2 flex-1 overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--page-ink) 12%, transparent)" }}>
            <span
              className="absolute inset-y-0 left-0 rounded-full transition-none"
              style={{ width: `${m.rate * 100 * p}%`, background: m.color }}
            />
          </span>
          <span className="w-9 shrink-0 text-right tabular-nums" style={{ color: "var(--page-soft)" }}>
            {(m.rate * 100 * p).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function ShowcaseCard({ series, index, onOpen }: { series: BlindSeries; index: number; onOpen: (s: BlindSeries) => void }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 公仔图横向轮播：自动切换 + hover 暂停。
  useEffect(() => {
    if (!inView || paused || series.figures.length <= 1) return;
    const t = setInterval(() => setActive((a) => (a + 1) % series.figures.length), CAROUSEL_MS);
    return () => clearInterval(t);
  }, [inView, paused, series.figures.length]);

  // 3D 倾斜：鼠标位置驱动（仅桌面 hover，触屏无 mousemove）。
  function onMove(e: React.MouseEvent) {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 10).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 12).toFixed(2)}deg`);
  }
  function onLeave() {
    const el = tiltRef.current;
    if (el) {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    }
  }

  const figs = useMemo(() => series.figures, [series]);

  return (
    <div
      ref={(node) => {
        ref.current = node;
        cardRef.current = node;
      }}
      className={`blind-showcase-card card-enter relative ${inView ? "is-in" : ""}`}
      style={{ animationDelay: `${(index % 2) * 80}ms` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        onLeave();
      }}
    >
      <div
        ref={tiltRef}
        className="blind-tilt relative overflow-hidden rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6"
        style={{
          // 延用 home 3色：奶油黄底 + 蜜桃粉边 + 暖杏高光，不硬编码 hex。
          background: "color-mix(in srgb, var(--page-bg) 82%, white)",
          borderColor: "color-mix(in srgb, var(--page-accent) 55%, transparent)",
          boxShadow: `0 18px 50px color-mix(in srgb, ${series.accent} 28%, transparent)`,
        }}
        onMouseMove={onMove}
      >
        {/* 霓虹描边流转层 */}
        <span className="blind-neon-edge pointer-events-none absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem]" aria-hidden />

        <div className="relative flex items-center gap-3">
          <div
            className="blind-aura grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
            style={{ background: `linear-gradient(135deg, ${series.saturation}, ${series.accent})` }}
          >
            🎁
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--hot)" }}>
              {series.brand}
            </p>
            <h3 className="font-display truncate text-lg leading-tight sm:text-xl" style={{ color: "var(--page-ink)" }}>
              {series.name}
            </h3>
          </div>
        </div>

        {/* 公仔轮播展示窗：只渲染当前张 + 预取下一张，避免一次挂载 13 张图 */}
        <div
          className="blind-carousel relative mt-4 aspect-square w-full overflow-hidden rounded-2xl"
          style={{ background: `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${series.accent} 22%, white), color-mix(in srgb, var(--page-bg) 60%, white))` }}
        >
          {(() => {
            const cur = figs[active];
            const next = figs[(active + 1) % figs.length];
            return (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={cur.id}
                  src={`${BASE_PATH}${thumbUrl(figureImage(series.slug, cur.id))}`}
                  alt={cur.name}
                  className="blind-carousel-item absolute inset-0 m-auto h-[78%] w-[78%] rounded-2xl object-cover"
                  style={{ boxShadow: `0 8px 28px color-mix(in srgb, ${cur.accent} 45%, transparent)` }}
                  loading="lazy"
                  decoding="async"
                />
                {/* 预取下一张，减少轮播切换时的空窗；隐藏但加载 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${BASE_PATH}${thumbUrl(figureImage(series.slug, next.id))}`}
                  alt=""
                  className="absolute inset-0 m-auto h-[78%] w-[78%] rounded-2xl object-cover opacity-0"
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                />
              </>
            );
          })()}
          {/* 当前款式名 */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/35 to-transparent px-4 pb-3 pt-8">
            <span className="truncate text-sm font-semibold text-white drop-shadow">{figs[active].name}</span>
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
              style={{ background: rarityMeta[figs[active].rarity].color }}
            >
              {rarityMeta[figs[active].rarity].label}
            </span>
          </div>
          {/* 轮播指示点 */}
          <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5">
            {figs.slice(0, 8).map((f, i) => (
              <span
                key={f.id}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === active ? 16 : 6,
                  background: i === active ? "white" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        </div>

        {/* 稀有度概率条 */}
        <RarityBars active={inView} />

        <p className="mt-3 line-clamp-2 text-xs leading-5" style={{ color: "var(--page-soft)" }}>
          {series.story}
        </p>

        <button
          onClick={() => onOpen(series)}
          className="mt-4 w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-95"
          style={{ background: `linear-gradient(135deg, ${series.saturation}, ${series.accent})` }}
        >
          🎲 开盒 · ¥{series.price}
        </button>
      </div>
    </div>
  );
}

/**
 * 盲盒「轮转展示柜」：每个系列一张 3D 倾斜卡，公仔图自动轮播 + 霓虹描边 +
 * 稀有度概率条动画。配色延用 home 3色（由父级 .theme-home 提供 --page-*）。
 * 点开盒走 BlindBoxOpener 完整仪式。
 */
export function BlindShowcase() {
  const [opening, setOpening] = useState<BlindSeries | null>(null);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {blindSeries.map((s, i) => (
        <ShowcaseCard key={s.slug} series={s} index={i} onOpen={setOpening} />
      ))}
      <BlindBoxOpener series={opening} onClose={() => setOpening(null)} />
    </div>
  );
}
