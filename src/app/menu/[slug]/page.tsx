import { notFound } from "next/navigation";
import { products, getProduct } from "@/lib/data/products";
import { MenuDetail } from "@/components/product/MenuDetail";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = [...new Set([...(product.bundleSlugs ?? []), ...product.relatedSlugs])]
    .map(getProduct)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return <MenuDetail product={product} related={related} />;
}
