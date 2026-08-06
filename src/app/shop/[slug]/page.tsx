import { notFound } from "next/navigation";
import Link from "next/link";
import { products, getProduct, productImages } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils/format";
import { MediaGallery } from "@/components/common/MediaGallery";
import { CollapsibleStory } from "@/components/common/CollapsibleStory";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AddToCart } from "@/components/product/AddToCart";
import { DetailActionBar } from "@/components/product/DetailActionBar";
import { DetailHeatBar } from "@/components/product/DetailHeatBar";
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
      <div className="container-shell py-8 sm:py-14">
      <Link href="/shop" className="text-sm text-[var(--muted)] hover:text-black">← 返回赛博进货部</Link>
      <div className="mt-6 grid gap-6 sm:gap-12 lg:grid-cols-[1fr_.9fr] lg:gap-10">
        {/* 主图：手机方形省屏、桌面 4/5；自动轮播 + 缩略图首屏提速 */}
        <div className="relative">
          <MediaGallery images={productImages(product)} alt={product.name} aspect="4/5" auto>
            <div className="absolute left-4 top-4 right-4 flex items-start justify-end">
              <FavoriteButton slug={product.slug} />
            </div>
          </MediaGallery>
        </div>

        {/* 文字区：卡片化聚合，手机更紧凑、更有层次 */}
        <div className="lg:pt-6">
          {/* 标题卡 */}
          <div className="rounded-[1.25rem] border border-white/60 bg-white/65 p-5 backdrop-blur sm:rounded-[1.5rem] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--hot)]">{product.badge}</p>
            <h1 className="font-display mt-2 text-2xl leading-tight sm:mt-3 sm:text-3xl md:text-4xl" style={{ color: "var(--page-ink)" }}>{product.name}</h1>
            <p className="mt-2 text-sm text-[var(--muted)] sm:mt-3 sm:text-base">{product.subtitle}</p>

            {/* 价格 + 虚拟热度条 同行 */}
            <div className="mt-5 flex items-end gap-4">
              <p className="font-display text-3xl sm:text-4xl md:text-5xl" style={{ color: "var(--page-ink)" }}>
                {formatCurrency(product.price)}
                <span className="ml-1 align-top text-xs font-sans text-[var(--muted)]">虚拟</span>
              </p>
              <div className="min-w-0 flex-1">
                <DetailHeatBar value={product.sold / 10000} saturation={product.saturation} accent={product.accent} />
              </div>
            </div>
            <p className="mt-1.5 text-xs text-[var(--muted)]">虚拟金额，无需真实支付</p>

            {/* 卖点 chip：手机横向滚动、桌面 flex-wrap */}
            <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              <Badge tone="gold" className="shrink-0 normal-case tracking-normal">已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单</Badge>
              <Badge tone="green" className="shrink-0 normal-case tracking-normal">虚拟库存仅剩 {product.stock} 件</Badge>
              <Badge tone={product.deliveryFlavor === "rider" ? "hot" : "blue"} className="shrink-0 normal-case tracking-normal">{product.deliveryFlavor === "rider" ? "骑手配送" : "快递派送"} · 永不签收</Badge>
            </div>
          </div>

          {/* 描述 */}
          <p className="mt-5 text-[15px] leading-7 text-[var(--muted)] sm:mt-6 sm:text-lg sm:leading-8">{product.description}</p>

          {/* 故事卡：手机折叠、桌面展开 */}
          <div className="mt-5 sm:mt-6">
            <CollapsibleStory eyebrow="Product Story" title="产品故事">
              <p className="leading-7 text-[var(--muted)]">{product.story}</p>
            </CollapsibleStory>
          </div>

          {/* 桌面加购区（手机用底部固定操作栏） */}
          <div className="mt-6 hidden md:block">
            <AddToCart product={product} />
          </div>
        </div>
      </div>

      <ReviewSection productSlug={product.slug} />
      {related.length > 0 && (
        <section className="mt-14 border-t border-black/10 pt-8 sm:mt-20 sm:pt-12">
          <h2 className="font-display mb-4 text-3xl sm:text-5xl" style={{ color: "var(--page-ink)" }}>凑单与相关推荐</h2>
          <p className="mb-10 text-[var(--muted)]">继续加购可获得更多多巴胺币，但仍然不会真实扣款。</p>
          <ProductGrid products={related} interactive />
        </section>
      )}
      </div>

      {/* 手机底部固定操作栏：全宽贴边 */}
      <DetailActionBar product={product} />
      {/* 底部栏占位，避免盖住页面末尾内容 */}
      <div className="h-20 md:hidden" aria-hidden />
    </section>
  );
}
