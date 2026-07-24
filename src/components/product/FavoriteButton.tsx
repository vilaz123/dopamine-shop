"use client";

import { Heart } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAssetStore } from "@/stores/asset-store";
import { playFav } from "@/lib/utils/sfx";

export function FavoriteButton({ slug }: { slug: string }) {
  const favorites = useAssetStore((state) => state.favorites);
  const toggleFavorite = useAssetStore((state) => state.toggleFavorite);
  const active = favorites.includes(slug);
  const prev = useRef(active);
  const [burst, setBurst] = useState(0);

  // 仅在 false→true(刚收藏)时触发 pop + 粒子 + 音;取消收藏不炸。
  useEffect(() => {
    if (!prev.current && active) {
      setBurst((b) => b + 1);
      playFav();
    }
    prev.current = active;
  }, [active]);

  const hearts = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        return { x: Math.cos(angle) * 26, y: Math.sin(angle) * 26 - 10, d: 0.5 + (i % 3) * 0.12 };
      }),
    // burst 变化才重新生成,避免每次渲染抖动
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst],
  );

  return (
    <button
      onClick={(event) => {
        event.preventDefault();
        toggleFavorite(slug);
      }}
      className="relative rounded-full bg-white/85 p-3 text-black shadow-lg transition hover:scale-105"
      aria-label={active ? "取消收藏" : "收藏"}
    >
      <Heart
        size={18}
        fill={active ? "var(--hot)" : "none"}
        color={active ? "var(--hot)" : "currentColor"}
        className={burst ? "fav-pop" : undefined}
      />
      {burst > 0 && (
        <span key={burst} className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
          {hearts.map((h, i) => (
            <span
              key={i}
              className="fav-heart absolute text-xs"
              style={
                {
                  color: "var(--hot)",
                  "--x": `${h.x}px`,
                  "--y": `${h.y}px`,
                  "--d": `${h.d}s`,
                } as React.CSSProperties
              }
            >
              ❤
            </span>
          ))}
        </span>
      )}
    </button>
  );
}
