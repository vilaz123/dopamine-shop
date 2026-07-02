import { seededReviews } from "@/lib/data/reviews";
import { readJson, storageKeys, writeJson } from "@/lib/utils/storage";
import type { Review } from "@/types/review";
import type { ReviewService } from "../types";

function getUserReviews() {
  return readJson<Review[]>(storageKeys.reviews, []);
}

export const localReviewService: ReviewService = {
  async listByProduct(slug: string) {
    return [...seededReviews, ...getUserReviews()].filter((review) => review.productSlug === slug);
  },
  async add(input) {
    const review: Review = {
      ...input,
      id: `review-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    const reviews = getUserReviews();
    writeJson(storageKeys.reviews, [review, ...reviews].slice(0, 120));
    return review;
  },
};
