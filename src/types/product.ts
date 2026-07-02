export type ProductCategory = "fragrance" | "tech" | "home" | "fashion";

export type ProductOption = {
  label: string;
  values: string[];
};

export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  price: number;
  currency: "CNY";
  description: string;
  story: string;
  badge: string;
  accent: string;
  monogram: string;
  options: ProductOption[];
  relatedSlugs: string[];
};
