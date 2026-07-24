"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 进视口一次性触发(默认 once)。用于卡片入场动画。零依赖。
 * 若 IntersectionObserver 不可用(SSR/老环境),回退为可见,保证内容不卡在隐藏态。
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(options?: IntersectionObserverInit, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      }
    }, options ?? { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    io.observe(node);
    return () => io.disconnect();
  }, [once]);

  return { ref, inView };
}
