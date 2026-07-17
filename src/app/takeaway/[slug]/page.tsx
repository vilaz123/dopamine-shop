import { notFound } from "next/navigation";
import Link from "next/link";
import { getTakeawayShop, takeawayShops, formatMonthlySales, shopImages } from "@/lib/data/takeaway-shops";
import { getProduct } from "@/lib/data/products";
import { MediaGallery } from "@/components/common/MediaGallery";
import { TakeawayMealCard } from "@/components/takeaway/TakeawayMealCard";
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
    <section className="container-shell py-14">
      <Link href="/takeaway" className="text-sm text-[#5A4A6A] hover:text-black">← 返回外卖</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_.9fr]">
        <div className="relative">
          <MediaGallery images={shopImages(shop)} alt={shop.name} aspect="4/3">
            {shop.promo && (
              <div className="absolute left-5 top-5 rounded-full bg-[#ffd23f] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-lg">
                {shop.promo}
              </div>
            )}
          </MediaGallery>
        </div>
        <div className="lg:pt-6">
          <p className="text-xs uppercase tracking-[0.32em] text-[#FF3D81]">{shop.category}</p>
          <h1 className="font-display mt-4 text-6xl leading-none md:text-7xl">{shop.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-lg text-[#3D3357]">
            <span className="font-semibold text-black">★ {shop.rating.toFixed(1)}</span>
            <span>虚拟月售 {formatMonthlySales(shop.monthlySales)}</span>
            <span>{shop.distanceKm}km 幻想距离</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-black/10 px-4 py-2 text-sm">起送 ¥{shop.minOrder}</span>
            <span className="rounded-full border border-black/10 px-4 py-2 text-sm">配送 ¥{shop.deliveryFee}</span>
            <span className="rounded-full border border-black/10 px-4 py-2 text-sm">预计 {shop.deliveryTimeMin} 分钟</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {shop.discounts.map((discount) => (
              <span key={discount} className="rounded-full border border-yellow-400/50 bg-yellow-400/15 px-3 py-1 text-xs text-[#FF3D81]">{discount}</span>
            ))}
          </div>
          <div className="mt-8">
            <RiderMapMock etaMinutes={shop.deliveryTimeMin} />
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-black/10 pt-12">
        <h2 className="font-display mb-8 text-5xl">本店菜单</h2>
        <p className="mb-10 text-[#5A4A6A]">选规格可展开口味/辣度等选项，加入购物车后仍可在购物车里改。</p>
        <div className="grid gap-6 md:grid-cols-2">
          {meals.map((product) => (
            <TakeawayMealCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {flagship && <ReviewSection productSlug={flagship.slug} />}
    </section>
  );
}
