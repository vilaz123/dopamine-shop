import { notFound } from "next/navigation";
import Link from "next/link";
import { products, getProduct } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils/format";
import { ProductMonogram } from "@/components/product/ProductMonogram";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AddToCart } from "@/components/product/AddToCart";
import { ReviewSection } from "@/components/reviews/ReviewSection";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const related = product.relatedSlugs.map(getProduct).filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section className="container-shell py-14">
      <Link href="/shop" className="text-sm text-[#7a7167] hover:text-black">← 返回虚拟商店</Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_.9fr]">
        <ProductMonogram product={product} large />
        <div className="lg:pt-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">{product.badge}</p>
          <h1 className="font-display mt-4 text-6xl leading-none md:text-7xl">{product.name}</h1>
          <p className="mt-4 text-xl text-[#7a7167]">{product.subtitle}</p>
          <p className="font-display mt-8 text-5xl">{formatCurrency(product.price)}</p>
          <p className="mt-8 text-lg leading-8 text-[#554c43]">{product.description}</p>
          <div className="mt-8 rounded-[2rem] border border-black/10 bg-[#fffaf2] p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-[#8b6b2f]">Product Story</p>
            <p className="mt-4 leading-7 text-[#554c43]">{product.story}</p>
          </div>
          <div className="mt-8">
            <AddToCart product={product} />
          </div>
        </div>
      </div>
      <ReviewSection productSlug={product.slug} />
      {related.length > 0 && (
        <section className="mt-20 border-t border-black/10 pt-12">
          <h2 className="font-display mb-10 text-5xl">你可能也想虚拟拥有</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </section>
  );
}
