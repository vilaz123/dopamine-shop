"use client";

import { useEffect, useRef } from "react";
import { useUiStore } from "@/stores/ui-store";
import { playCoin } from "@/lib/utils/sfx";

const MAX_COINS = 8;
const DURATION = 700;

type Coin = { id: string; dx: number; delay: number; arc: number };

/**
 * 全局飞金币层:监听 ui-store.flyToCart,从触发点抛物线飞向 Header 购物车图标。
 * 用原生 Web Animations API,零依赖;移动端 Header 购物车图标始终可见(不进抽屉)。
 * 落地时播 playCoin();购物车角标 pop 由 CartButton 监听 count 自行触发。
 */
export function FlyToCart() {
  const fly = useUiStore((state) => state.flyToCart);
  const clearFly = useUiStore((state) => state.clearFly);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fly) return;
    const layer = layerRef.current;
    if (!layer) return;

    // 取落点:Header 购物车按钮锚;取不到回退视口右上角。
    const targetEl = document.querySelector<HTMLElement>("[data-cart-target]");
    const rect = targetEl?.getBoundingClientRect();
    const toX = rect ? rect.left + rect.width / 2 : window.innerWidth - 32;
    const toY = rect ? rect.top + rect.height / 2 : 24;

    const count = Math.min(MAX_COINS, Math.max(1, fly.coins));
    const coins: Coin[] = Array.from({ length: count }, (_, i) => ({
      id: `${fly.id}-${i}`,
      dx: (Math.random() - 0.5) * 40,
      delay: i * 35,
      arc: -120 - Math.random() * 80,
    }));

    // 逐枚创建 DOM,用 WAAPI 驱动,结束自移除。
    let remaining = coins.length;
    coins.forEach((coin) => {
      const el = document.createElement("span");
      el.textContent = "🪙";
      el.style.cssText =
        "position:fixed;left:0;top:0;font-size:20px;line-height:1;pointer-events:none;z-index:90;will-change:transform,opacity;";
      layer.appendChild(el);

      const midX = (fly.fromX + toX) / 2 + coin.dx;
      const midY = Math.min(fly.fromY, toY) + coin.arc;
      el.animate(
        [
          { transform: `translate(${fly.fromX - 10}px, ${fly.fromY - 10}px) scale(0.4) rotate(0deg)`, opacity: 0 },
          { transform: `translate(${midX - 10}px, ${midY - 10}px) scale(1.1) rotate(180deg)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${toX - 10}px, ${toY - 10}px) scale(0.5) rotate(360deg)`, opacity: 0 },
        ],
        { duration: DURATION, delay: coin.delay, easing: "cubic-bezier(0.3,0.7,0.4,1)", fill: "forwards" },
      ).onfinish = () => {
        el.remove();
        remaining -= 1;
        // 最后一枚落地时响金币音并清状态(只响一次)。
        if (remaining === 0) {
          playCoin();
          clearFly();
        }
      };
    });

    // 兜底:若 onfinish 未触发(极端情况),2s 后强制清。
    const fallback = window.setTimeout(clearFly, DURATION + count * 35 + 600);
    return () => window.clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fly]);

  return <div ref={layerRef} aria-hidden className="pointer-events-none fixed inset-0 z-[90]" />;
}
