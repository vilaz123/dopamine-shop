"use client";

import { useEffect, useState } from "react";

/**
 * 进视口后 0→1 的三次缓动填充进度，给「热度条 / 人气条」用。
 * 复刻 BlindShowcase RarityBars 的 requestAnimationFrame 动画。
 * active 变 false 时归零，便于离视口后再次入场重播。
 */
export function useFill(active: boolean, ms = 700) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!active) {
      setP(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setP(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ms]);
  return p;
}
