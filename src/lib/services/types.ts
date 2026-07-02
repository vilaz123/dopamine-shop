import type { Product } from "@/types/product";
import type { Review } from "@/types/review";

export interface ProductService {
  list(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  listByCategory(category: Product["category"]): Promise<Product[]>;
}

export interface ReviewService {
  listByProduct(slug: string): Promise<Review[]>;
  add(review: Omit<Review, "id" | "createdAt">): Promise<Review>;
}
