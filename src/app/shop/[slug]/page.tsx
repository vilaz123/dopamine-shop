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
        <div className="relative">
          {/* 主图自动轮播 + 缩略图首屏提速 + 指示点 */}
          <MediaGallery images={productImages(product)} alt={product.name} aspect="4/5" auto>
            <div className="absolute left-4 top-4 right-4 flex items-start justify-end">
              <FavoriteButton slug={product.slug} />
            </div>
          </MediaGallery>
        </div>
        <div className="lg:pt-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--hot)]">{product.badge}</p>
          <h1 className="font-display mt-3 text-2xl leading-tight sm:mt-4 sm:text-3xl md:text-4xl" style={{ color: "var(--page-ink)" }}>{product.name}</h1>
          <p className="mt-2 text-base text-[var(--muted)] sm:mt-3 sm:text-lg">{product.subtitle}</p>

          {/* 价格 + 虚拟热度条 同行（手机紧凑、灵动） */}
          <div className="mt-5 flex items-end justify-between gap-4 sm:mt-6">
            <p className="font-display text-3xl sm:text-4xl md:text-5xl" style={{ color: "var(--page-ink)" }}>
              {formatCurrency(product.price)}
              <span className="ml-1 align-top text-xs font-sans text-[var(--muted)]">虚拟</span>
            </p>
            <div className="hidden w-40 shrink-0 sm:block">
              <DetailHeatBar value={product.sold / 10000} saturation={product.saturation} accent={product.accent} />
            </div>
          </div>
          <p className="mt-1 text-xs font-sans text-[var(--muted)] sm:ml-2 sm:inline">虚拟金额，无需真实支付</p>

          {/* 卖点 badges：手机横向滚动 chip 行，桌面 flex-wrap */}
          <div className="mt-5 flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            <Badge tone="gold" className="shrink-0">已有 {product.sold.toLocaleString("zh-CN")} 人虚拟下单</Badge>
            <Badge tone="green" className="shrink-0">虚拟库存仅剩 {product.stock} 件</Badge>
            <Badge tone={product.deliveryFlavor === "rider" ? "hot" : "blue"} className="shrink-0">{product.deliveryFlavor === "rider" ? "骑手配送" : "快递派送"} · 永不签收</Badge>
          </div>

          {/* 手机端虚拟热度条（窄屏放价格下方整行） */}
          <div className="mt-5 sm:hidden">
            <DetailHeatBar value={product.sold / 10000} saturation={product.saturation} accent={product.accent} />
          </div>

          <p className="mt-6 text-base leading-7 text-[var(--muted)] sm:mt-8 sm:text-lg sm:leading-8">{product.description}</p>

          {/* 故事卡：手机折叠、桌面展开 */}
          <div className="mt-6 sm:mt-8">
            <CollapsibleStory eyebrow="Product Story" title="">
              <p className="leading-7 text-[var(--muted)]">{product.story}</p>
            </CollapsibleStory>
          </div>

          {/* 桌面加购区（手机用底部固定操作栏，这里 hidden） */}
          <div className="mt-8 hidden md:block">
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

      {/* 手机底部固定操作栏 */}
      <DetailActionBar product={product} />
    </section>
  );
}
