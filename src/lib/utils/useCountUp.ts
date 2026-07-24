"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 数字进视口从 0 滚到目标值。IntersectionObserver + requestAnimationFrame,零依赖。
 * 仅在客户端运行;SSR 初始直接渲染目标值,避免水合不一致(组件首次渲染按 visible=false 返回 0,
 * 客户端挂载后若已在视口则立即开始,首屏可见数字会从 0 起跳——可接受且仅客户端)。
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(target: number, duration = 700) {
  const [value, setValue] = useState(target);
  const ref = useRef<T | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (target <= 0) {
      setValue(0);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(Math.round(target * eased));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [target, duration]);

  return { value, ref };
}
