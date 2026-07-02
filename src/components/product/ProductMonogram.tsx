import type { Product } from "@/types/product";

export function ProductMonogram({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div
      className="monogram-grid relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[2rem] luxury-shadow"
      style={{
        background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,.35), transparent 28%), linear-gradient(135deg, ${product.accent}, #111 78%)`,
      }}
    >
      <div className="absolute inset-4 rounded-[1.5rem] border border-white/25" />
      <div className="absolute left-6 top-6 text-xs uppercase tracking-[0.35em] text-white/70">Void Goods</div>
      <div className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.35em] text-white/70">∞ stock</div>
      <div className="font-display text-white/90" style={{ fontSize: large ? "8rem" : "4.75rem" }}>
        {product.monogram}
      </div>
    </div>
  );
}
