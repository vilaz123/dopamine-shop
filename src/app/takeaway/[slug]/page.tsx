import { notFound } from "next/navigation";
import Link from "next/link";
import { getTakeawayShop, takeawayShops, takeawayBucket, formatMonthlySales, shopImages } from "@/lib/data/takeaway-shops";
import { getProduct } from "@/lib/data/products";
import { MediaGallery } from "@/components/common/MediaGallery";
import { CollapsibleStory } from "@/components/common/CollapsibleStory";
import { TakeawayMenuButton } from "@/components/takeaway/TakeawayMenuButton";
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
        <div className="relative mx-auto w-full max-w-[min(92vw,520px)] lg:mr-0">
          {/* 主图自动轮播 + 缩略图首屏提速 */}
          <MediaGallery images={shopImages(shop)} alt={shop.name} aspect="4/3" auto>
            {shop.promo && (
              <div className="absolute left-5 top-5 rounded-full bg-[var(--gold)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-lg">
                {shop.promo}
              </div>
            )}
          </MediaGallery>
          {/* 门店氛围标牌：渐变色块 + slogan */}
          <div className="mt-4 flex items-center gap-3 rounded-[1rem] border border-white/20 p-3 backdrop-blur" style={{ background: `linear-gradient(135deg, ${shop.saturation}33, ${shop.accent}22)` }}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-xl" style={{ background: `linear-gradient(135deg, ${shop.saturation}, ${shop.accent})` }}>{shop.category === "米其林餐厅" ? "👑" : "🔥"}</span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{takeawayBucket(shop.category)} · 热门店</p>
              <p className="mt-0.5 text-sm text-white/90">骑手已出发，热量永远差一公里抵达。</p>
            </div>
          </div>
        </div>
        <div className="lg:pt-4">
          {/* 店名卡：聚合标题 + 评分 + 信息，层次更清晰 */}
          <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-5 backdrop-blur sm:rounded-[1.5rem] sm:p-6" style={{ boxShadow: `0 18px 50px ${shop.accent}33` }}>
            <div className="flex items-center gap-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--page-highlight)]">{takeawayBucket(shop.category)}</p>
              {shop.tags.slice(0, 1).map((t) => <span key={t} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/80">#{t}</span>)}
            </div>
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

      <section className="mt-12 border-t border-white/15 pt-8 sm:mt-16 sm:pt-12">
        <h2 className="font-display text-base text-white sm:text-lg">本店菜单</h2>
        <p className="mt-2 text-sm text-white/70">翻开菜单像点菜一样逐页选，加购后仍可在购物车里改。</p>
        <TakeawayMenuButton meals={meals} />
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
