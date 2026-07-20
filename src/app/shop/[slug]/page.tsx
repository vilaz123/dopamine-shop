import { notFound } from "next/navigation";
import Link from "next/link";
import { products, getProduct, productImages } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils/format";
import { MediaGallery } from "@/components/common/MediaGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AddToCart } from "@/components/product/AddToCart";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { Badge } from "@/components/ui/Badge";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = [...new Set([...(product.bundleSlugs ?? []), ...product.relatedSlugs])]
    .map(getProduct)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section className="theme-shop relative overflow-hidden">
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />
      <div className="container-shell py-10 sm:py-14">
      <Link href="/shop" className="text-sm text-[var(--muted)] hover:text-black">← 返回多巴胺仓</Link>
      <div className="mt-8 grid gap-8 sm:gap-12 lg:grid-cols-[1fr_.9fr]">
        <div className="relative">
          <MediaGallery images={productImages(product)} alt={product.name} aspect="4/5">
            <div className="absolute left-4 top-4 right-4 flex items-start justify-end">
              <FavoriteButton slug={product.slug} />
            </div>
          </MediaGallery>
        </div>
        <div className="lg:pt-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--hot)]">{product.badge}</p>
          <h1 className="font-display mt-4 text-4xl leading-none sm:text-6xl md:text-7xl" style={{ color: "var(--page-ink)" }}>{product.name}</h1>
          <p className="mt-3 text-lg text-[var(--muted)] sm:mt-4">{product.subtitle}</p>
          <p className="font-display mt-6 text-4xl sm:mt-8 sm:text-5xl" style={{ color: "var(--page-ink)" }}>{formatCurrency(product.price)}<span className="ml-2 align-top text-sm font-sans text-[var(--muted)]">虚拟金额，无需真实支付</span></p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge tone="gold">已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单</Badge>
            <Badge tone="green">虚拟库存仅剩 {product.stock} 件</Badge>
            <Badge tone={product.deliveryFlavor === "rider" ? "hot" : "blue"}>{product.deliveryFlavor === "rider" ? "骑手配送" : "快递派送"} · 永不签收</Badge>
          </div>
          <p className="mt-8 text-lg leading-8 text-[var(--muted)]">{product.description}</p>
          <div className="mt-8 rounded-[1.5rem] border border-white/50 bg-white/65 p-5 backdrop-blur sm:rounded-[2rem] sm:p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--hot)]">Product Story</p>
            <p className="mt-4 leading-7 text-[var(--muted)]">{product.story}</p>
          </div>
          <div className="mt-8">
            <AddToCart product={product} />
          </div>
        </div>
      </div>
      <ReviewSection productSlug={product.slug} />
      {related.length > 0 && (
        <section className="mt-20 border-t border-black/10 pt-12">
          <h2 className="font-display mb-4 text-5xl" style={{ color: "var(--page-ink)" }}>凑单与相关推荐</h2>
          <p className="mb-10 text-[var(--muted)]">继续加购可获得更多多巴胺币，但仍然不会真实扣款。</p>
          <ProductGrid products={related} />
        </section>
      )}
      </div>
    </section>
  );
}
