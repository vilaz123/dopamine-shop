"use client";

import { useRef, useState, useEffect, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { thumbUrl, assetUrl } from "@/lib/utils/image";
import { useInView } from "@/lib/utils/useInView";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SWIPE_THRESHOLD = 40;
const AUTO_MS = 3200;
// 用户滑动/手动切图后暂停自动轮播的时间，避免和手势抢
const PAUSE_AFTER_INTERACTION_MS = 4500;

type MediaGalleryProps = {
  images: string[];
  alt: string;
  aspect: "4/5" | "4/3";
  /** Overlay layer (tag chips, favorite button, promo badge…) positioned over the main image. */
  children?: ReactNode;
  /** 自动轮播（详情页主图用）。列表卡有独立轮播，这里给详情页一个轻量实现。 */
  auto?: boolean;
};

/**
 * Image gallery with a large main shot and a scrollable thumbnail strip.
 * 主图首屏用缩略图（thumbUrl）抢 LCP，更快；缩略图条点选/手势滑动/自动轮播切换。
 * basePath 前缀让图片在 GitHub Pages 子路径与本地都能解析。
 */
export function MediaGallery({ images, alt, aspect, children, auto = false }: MediaGalleryProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);
  const pausedUntil = useRef(0);
  const [paused, setPaused] = useState(false);

  if (!images.length) return null;
  const last = images.length - 1;
  const go = (next: number) => setActive((current) => (next < 0 ? last : next > last ? 0 : next));

  function pauseTemporarily() {
    pausedUntil.current = (typeof performance !== "undefined" ? performance.now() : Date.now()) + PAUSE_AFTER_INTERACTION_MS;
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    swiping.current = true;
    pauseTemporarily();
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (!swiping.current) return;
    swiping.current = false;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;
    // Only treat as a horizontal swipe when horizontal motion clearly dominates
    // vertical, so ordinary vertical page scrolling is left to the browser.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(active + (dx < 0 ? 1 : -1));
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
      pauseTemporarily();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
      pauseTemporarily();
    }
  }

  // 自动轮播：进视口、未 hover、多图、且不在交互暂停窗口内时按 AUTO_MS 切换。
  useEffect(() => {
    if (!auto || images.length <= 1 || !inView || paused) return;
    const t = setInterval(() => {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now < pausedUntil.current) return;
      setActive((a) => (a + 1) % images.length);
    }, AUTO_MS);
    return () => clearInterval(t);
  }, [auto, images.length, inView, paused]);

  const aspectClass = aspect === "4/5" ? "aspect-[4/5]" : "aspect-[4/3]";

  return (
    <div ref={ref} className="relative">
      <div
        className={`relative ${aspectClass} w-full overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] luxury-shadow`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${alt} 图片`}
        style={{ touchAction: "pan-y" }}
      >
        {/* 主图首屏用缩略图抢 LCP（比原图小很多），点切图仍走缩略图条点选 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active}
          src={`${BASE_PATH}${thumbUrl(images[active])}`}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="(max-width: 768px) 92vw, 45vw"
        />
        {/* 预取下一张缩略图，减少轮播/滑动切图空窗 */}
        {images.length > 1 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${BASE_PATH}${thumbUrl(images[(active + 1) % images.length])}`}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
        {children}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => { go(active - 1); pauseTemporarily(); }}
              aria-label="上一张"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65 sm:h-12 sm:w-12"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => { go(active + 1); pauseTemporarily(); }}
              aria-label="下一张"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65 sm:h-12 sm:w-12"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((src, index) => (
                <span
                  key={src}
                  aria-hidden
                  className={`h-1.5 rounded-full transition-all ${index === active ? "w-6 bg-white" : "w-1.5 bg-white/45"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, index) => {
            const selected = index === active;
            return (
              <button
                key={src}
                type="button"
                onClick={() => { setActive(index); pauseTemporarily(); }}
                aria-label={`查看第 ${index + 1} 张图`}
                aria-pressed={selected}
                className={`relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-2xl transition ${
                  selected ? "ring-2 ring-[var(--hot)] ring-offset-2 ring-offset-white" : "opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${BASE_PATH}${thumbUrl(src)}`} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
