import type { ProductCategory } from "@/types/product";
import { getProduct, products } from "@/lib/data/products";
import type { ProductService } from "../types";

export const localProductService: ProductService = {
  async list() {
    return products;
  },
  async getBySlug(slug: string) {
    return getProduct(slug);
  },
  async listByCategory(category: ProductCategory) {
    return products.filter((product) => product.category === category);
  },
};
