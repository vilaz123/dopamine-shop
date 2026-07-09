"use client";

import { useState, type ReactNode } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type MediaGalleryProps = {
  images: string[];
  alt: string;
  aspect: "4/5" | "4/3";
  /** Overlay layer (tag chips, favorite button, promo badge…) positioned over the main image. */
  children?: ReactNode;
};

/** Image gallery with a large main shot and a scrollable thumbnail strip.
 *  Used by product and shop detail pages.basePath is prepended to every src
 *  so images resolve under the GitHub Pages sub-path as well as locally. */
export function MediaGallery({ images, alt, aspect, children }: MediaGalleryProps) {
  const [active, setActive] = useState(0);

  if (!images.length) return null;

  const aspectClass = aspect === "4/5" ? "aspect-[4/5]" : "aspect-[4/3]";

  return (
    <div className="relative">
      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-[2rem] luxury-shadow`}>
        <img
          key={active}
          src={`${BASE_PATH}${images[active]}`}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
        {children}
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
                <img src={`${BASE_PATH}${src}`} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
