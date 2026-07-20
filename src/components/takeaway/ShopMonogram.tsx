import type { TakeawayShop } from "@/lib/data/takeaway-shops";
import { thumbUrl } from "@/lib/utils/image";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function ShopMonogram({ shop, large = false, priority = false }: { shop: TakeawayShop; large?: boolean; priority?: boolean }) {
  if (shop.image) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1rem] sm:rounded-[2rem] luxury-shadow">
        <img
          src={`${BASE_PATH}${large ? shop.image : thumbUrl(shop.image)}`}
          alt={shop.name}
          className="h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
        <div className="absolute left-3 top-3 text-[10px] uppercase tracking-[0.32em] text-white/85 sm:left-5 sm:top-5 sm:text-xs">{shop.category}</div>
        <div className="absolute bottom-3 right-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-black sm:bottom-5 sm:right-5 sm:px-3 sm:py-1 sm:text-xs">虚拟外卖</div>
      </div>
    );
  }

  return (
    <div
      className="monogram-grid relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[1rem] sm:rounded-[2rem] luxury-shadow"
      style={{
        background: `radial-gradient(circle at 22% 15%, rgba(255,255,255,.52), transparent 25%), radial-gradient(circle at 82% 25%, ${shop.saturation}, transparent 24%), linear-gradient(135deg, ${shop.saturation}, var(--ink) 78%)`,
      }}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.12)_0,rgba(255,255,255,.12)_1px,transparent_1px,transparent_12px)]" />
      <div className="absolute inset-3 rounded-[0.75rem] border border-white/25 sm:inset-4 sm:rounded-[1.5rem]" />
      <div className="absolute left-3 top-3 text-[10px] uppercase tracking-[0.32em] text-white/85 sm:left-5 sm:top-5 sm:text-xs">{shop.category}</div>
      <div className="absolute bottom-3 right-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-black sm:bottom-5 sm:right-5 sm:px-3 sm:py-1 sm:text-xs">虚拟外卖</div>
      <div className="font-display relative text-white/95 drop-shadow-2xl" style={{ fontSize: large ? "6rem" : "clamp(2rem, 14vw, 3.5rem)" }}>
        {shop.monogram}
      </div>
    </div>
  );
}
