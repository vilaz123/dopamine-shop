import type { Product } from "@/types/product";
import { thumbUrl } from "@/lib/utils/image";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function ProductMonogram({ product, large = false, priority = false }: { product: Product; large?: boolean; priority?: boolean }) {
  if (product.image) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] luxury-shadow">
        <img
          src={`${BASE_PATH}${large ? product.image : thumbUrl(product.image)}`}
          alt={product.name}
          className="h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          // @ts-expect-error fetchpriority 较新，React 类型尚未收录
          fetchpriority={priority ? "high" : "auto"}
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
        <div className="absolute left-6 top-6 text-xs uppercase tracking-[0.35em] text-white/85">Dopahub</div>
        <div className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.35em] text-white/85">虚拟库存 {product.stock}</div>
      </div>
    );
  }

  return (
    <div
      className="monogram-grid relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[2rem] luxury-shadow"
      style={{
        background: `radial-gradient(circle at 22% 15%, rgba(255,255,255,.52), transparent 25%), radial-gradient(circle at 82% 25%, ${product.saturation}, transparent 24%), linear-gradient(135deg, ${product.saturation}, #111 78%)`,
      }}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.12)_0,rgba(255,255,255,.12)_1px,transparent_1px,transparent_12px)]" />
      <div className="absolute inset-4 rounded-[1.5rem] border border-white/25" />
      <div className="absolute left-6 top-6 text-xs uppercase tracking-[0.35em] text-white/80">Dopahub</div>
      <div className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.35em] text-white/80">虚拟库存 {product.stock}</div>
      <div className="font-display relative text-white/95 drop-shadow-2xl" style={{ fontSize: large ? "8rem" : "4.75rem" }}>
        {product.monogram}
      </div>
    </div>
  );
}
