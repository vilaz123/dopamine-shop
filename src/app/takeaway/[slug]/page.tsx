import { notFound } from "next/navigation";
import Link from "next/link";
import { getTakeawayShop, takeawayShops, takeawayBucket, formatMonthlySales, shopImages } from "@/lib/data/takeaway-shops";
import { getProduct } from "@/lib/data/products";
import { MediaGallery } from "@/components/common/MediaGallery";
import { CollapsibleStory } from "@/components/common/CollapsibleStory";
import { TakeawayMealCard } from "@/components/takeaway/TakeawayMealCard";
import { TakeawayActionBar } from "@/components/takeaway/TakeawayActionBar";
import { DetailHeatBar } from "@/components/product/DetailHeatBar";
import { RiderMapMock } from "@/components/order/RiderMapMock";
import { ReviewSection } from "@/components/reviews/ReviewSection";

export function generateStaticParams() {
  return takeawayShops.map((shop) => ({ slug: shop.slug }));
}

export default async function TakeawayShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = getTakeawayShop(slug);
  if (!shop) notFound();
  const meals = shop.productSlugs.map(getProduct).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const flagship = meals[0];

  return (
    <section className="theme-food relative overflow-hidden">
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />
      <div className="container-shell py-8 sm:py-14">
      <Link href="/takeaway" className="text-sm text-white/70 hover:text-white">← 返回卡路里投影区</Link>
      <div className="mt-6 grid gap-6 sm:gap-10 lg:grid-cols-[1fr_.9fr] lg:gap-10">
        <div className="relative">
          {/* 主图自动轮播 + 缩略图首屏提速 */}
          <MediaGallery images={shopImages(shop)} alt={shop.name} aspect="4/3" auto>
            {shop.promo && (
              <div className="absolute left-5 top-5 rounded-full bg-[var(--gold)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-lg">
                {shop.promo}
              </div>
            )}
          </MediaGallery>
        </div>
        <div className="lg:pt-6">
          {/* 店名卡：聚合标题 + 评分 + 信息，层次更清晰 */}
          <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-5 backdrop-blur sm:rounded-[1.5rem] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--page-highlight)]">{takeawayBucket(shop.category)}</p>
            <h1 className="font-display mt-2 text-2xl leading-tight text-white sm:mt-3 sm:text-3xl md:text-4xl">{shop.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/85 sm:text-base">
              <span className="font-semibold text-[var(--gold)]">★ {shop.rating.toFixed(1)}</span>
              <span className="text-white/40">·</span>
              <span>虚拟月售 {formatMonthlySales(shop.monthlySales)}</span>
              <span className="text-white/40">·</span>
              <span>{shop.distanceKm}km 幻想距离</span>
            </div>
            <div className="mt-4">
              <DetailHeatBar value={shop.monthlySales / 12000} label="本月人气" saturation={shop.saturation} accent={shop.accent} />
            </div>

            {/* 起送/配送/时间：手机横向滚动 */}
            <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              <span className="shrink-0 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur">起送 ¥{shop.minOrder}</span>
              <span className="shrink-0 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur">配送 ¥{shop.deliveryFee}</span>
              <span className="shrink-0 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur">预计 {shop.deliveryTimeMin} 分钟</span>
            </div>
            {/* 满减：手机横向滚动 */}
            {shop.discounts.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {shop.discounts.map((discount) => (
                  <span key={discount} className="shrink-0 rounded-full border border-[var(--gold)]/50 bg-[var(--gold)]/15 px-3 py-1 text-xs text-[var(--gold)]">{discount}</span>
                ))}
              </div>
            )}
          </div>
          <div className="mt-5">
            <RiderMapMock etaMinutes={shop.deliveryTimeMin} />
          </div>
        </div>
      </div>

      {shop.intro && (
        <div className="mt-10 sm:mt-16">
          <CollapsibleStory eyebrow="Restaurant Story" title="关于这家餐厅" dark>
            <p className="leading-8 text-white/85 sm:text-lg sm:leading-9">{shop.intro}</p>
            {shop.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {shop.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white/80">#{tag}</span>
                ))}
              </div>
            )}
          </CollapsibleStory>
        </div>
      )}

      <section className="mt-14 border-t border-white/15 pt-12 sm:mt-16">
        <h2 className="font-display mb-6 text-3xl text-white sm:text-4xl">本店菜单</h2>
        <p className="mb-8 text-white/70 sm:mb-10">选规格可展开口味/辣度等选项，加入购物车后仍可在购物车里改。</p>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {meals.map((product) => (
            <TakeawayMealCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {flagship && <ReviewSection productSlug={flagship.slug} />}
      </div>

      {/* 手机底部固定操作栏：全宽贴边 */}
      <TakeawayActionBar shop={shop} />
      {/* 底部栏占位，避免盖住页面末尾内容 */}
      <div className="h-20 md:hidden" aria-hidden />
    </section>
  );
}
