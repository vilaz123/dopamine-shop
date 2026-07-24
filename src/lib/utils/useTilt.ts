"use client";

import { useRef } from "react";

/**
 * 桌面 hover 3D 倾斜：把鼠标位置写成 --rx/--ry 到 .tilt-3d 容器。
 * 复刻 BlindShowcase 的 onMove/onLeave。触屏无 mousemove 事件，自然不触发，零影响。
 */
export function useTilt() {
  const tiltRef = useRef<HTMLDivElement>(null);

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
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return { tiltRef, onMove, onLeave };
}
