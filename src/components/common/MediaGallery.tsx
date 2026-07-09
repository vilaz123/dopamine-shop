"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SWIPE_THRESHOLD = 40;

type MediaGalleryProps = {
  images: string[];
  alt: string;
  aspect: "4/5" | "4/3";
  /** Overlay layer (tag chips, favorite button, promo badge…) positioned over the main image. */
  children?: ReactNode;
};

/** Image gallery with a large main shot and a scrollable thumbnail strip.
 *  Swipe left/right (touch), arrow buttons, or arrow keys to move between shots.
 *  basePath is prepended to every src so images resolve under the GitHub Pages
 *  sub-path as well as locally. */
export function MediaGallery({ images, alt, aspect, children }: MediaGalleryProps) {
  const [active, setActive] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);

  if (!images.length) return null;

  const last = images.length - 1;
  const go = (next: number) => setActive((current) => (next < 0 ? last : next > last ? 0 : next));

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    swiping.current = true;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (!swiping.current) return;
    swiping.current = false;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;
    // Only treat as a horizontal swipe when the horizontal motion clearly dominates
    // the vertical one, so ordinary vertical page scrolling is left to the browser.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(active + (dx < 0 ? 1 : -1));
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    }
  }

  const aspectClass = aspect === "4/5" ? "aspect-[4/5]" : "aspect-[4/3]";

  return (
    <div className="relative">
      <div
        className={`relative ${aspectClass} w-full overflow-hidden rounded-[2rem] luxury-shadow`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${alt} 图片`}
        // pan-y keeps vertical scrolling with the browser; horizontal swipes are ours.
        style={{ touchAction: "pan-y" }}
      >
        <img
          key={active}
          src={`${BASE_PATH}${images[active]}`}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
        {children}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="上一张"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65 sm:h-12 sm:w-12"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
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
                onClick={() => setActive(index)}
                aria-label={`查看第 ${index + 1} 张图`}
                aria-pressed={selected}
                className={`relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-2xl transition ${
                  selected ? "ring-2 ring-[#8b6b2f] ring-offset-2 ring-offset-[#fffaf2]" : "opacity-70 hover:opacity-100"
                }`}
              >
                <img src={`${BASE_PATH}${src}`} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
