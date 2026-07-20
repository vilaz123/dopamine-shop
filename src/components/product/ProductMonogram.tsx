import type { Product } from "@/types/product";
import { thumbUrl } from "@/lib/utils/image";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function ProductMonogram({ product, large = false, priority = false }: { product: Product; large?: boolean; priority?: boolean }) {
  if (product.image) {
    return (
      <div className="relative aspect-[5/6] w-full overflow-hidden rounded-[1rem] sm:aspect-[4/5] sm:rounded-[1.25rem] md:rounded-[2rem] luxury-shadow">
        <img
          src={`${BASE_PATH}${large ? product.image : thumbUrl(product.image)}`}
          alt={product.name}
          className="h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10" />
        <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm sm:bottom-4 sm:left-4 sm:text-xs">库存 {product.stock}</div>
      </div>
    );
  }

  return (
    <div
      className="monogram-grid relative flex aspect-[5/6] w-full items-center justify-center overflow-hidden rounded-[1rem] sm:aspect-[4/5] sm:rounded-[1.25rem] md:rounded-[2rem] luxury-shadow"
      style={{
        background: `radial-gradient(circle at 22% 15%, rgba(255,255,255,.52), transparent 25%), radial-gradient(circle at 82% 25%, ${product.saturation}, transparent 24%), linear-gradient(135deg, ${product.saturation}, var(--ink) 78%)`,
      }}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.12)_0,rgba(255,255,255,.12)_1px,transparent_1px,transparent_12px)]" />
      <div className="absolute inset-3 rounded-[1rem] border border-white/25 sm:inset-4 sm:rounded-[1.5rem]" />
      <div className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm sm:bottom-4 sm:left-4 sm:text-xs">库存 {product.stock}</div>
      <div className="font-display relative text-white/95 drop-shadow-2xl" style={{ fontSize: large ? "clamp(5rem, 26vw, 8rem)" : "clamp(2.75rem, 18vw, 4.75rem)" }}>
        {product.monogram}
      </div>
    </div>
  );
}
