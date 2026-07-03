import type { Product } from "@/types/product";

export function recommendForUser(input: {
  products: Product[];
  history: string[];
  cartSlugs: string[];
  orderSlugs: string[];
  limit?: number;
}) {
  const { products, history, cartSlugs, orderSlugs, limit = 8 } = input;
  const interacted = [...history, ...cartSlugs, ...orderSlugs];
  if (interacted.length === 0) return [...products].sort((a, b) => b.sold - a.sold).slice(0, limit);

  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const categoryScores = new Map<string, number>();
  interacted.forEach((slug) => {
    const product = bySlug.get(slug);
    if (product) categoryScores.set(product.category, (categoryScores.get(product.category) ?? 0) + 3);
  });

  return [...products]
    .map((product) => {
      let score = product.sold / 1000 + (categoryScores.get(product.category) ?? 0);
      if (cartSlugs.some((slug) => bySlug.get(slug)?.bundleSlugs?.includes(product.slug))) score += 5;
      if (interacted.includes(product.slug)) score -= 4;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product)
    .slice(0, limit);
}
