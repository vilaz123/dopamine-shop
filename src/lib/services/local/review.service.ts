import { seededReviews } from "@/lib/data/reviews";
import { readJson, storageKeys, writeJson } from "@/lib/utils/storage";
import { getSupabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Review } from "@/types/review";
import type { ReviewService } from "../types";

type CloudReview = {
  id: string;
  product_slug: string;
  user_id: string;
  author: string | null;
  rating: number | null;
  title: string | null;
  body: string | null;
  created_at: string;
};

function mapCloudReview(r: CloudReview): Review {
  return {
    id: r.id,
    productSlug: r.product_slug,
    rating: r.rating ?? 5,
    title: r.title ?? "",
    body: r.body ?? "",
    author: r.author ?? "匿名仓友",
    createdAt: r.created_at,
    coinsEarned: 20,
  };
}

function getUserReviews() {
  return readJson<Review[]>(storageKeys.reviews, []);
}

export const localReviewService: ReviewService = {
  async listByProduct(slug) {
    const supabase = getSupabase();
    let cloud: Review[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_slug", slug)
        .order("created_at", { ascending: false });
      if (!error && data) cloud = (data as CloudReview[]).map(mapCloudReview);
    }

    const local = getUserReviews().filter((r) => r.productSlug === slug);
    const ids = new Set(cloud.map((r) => r.id));
    const localFresh = local.filter((r) => !ids.has(r.id));
    local.forEach((r) => ids.add(r.id));
    const seeds = seededReviews.filter((r) => r.productSlug === slug && !ids.has(r.id));

    return [...cloud, ...localFresh, ...seeds];
  },

  async add(input) {
    const supabase = getSupabase();
    const user = useAuthStore.getState().user;
    if (supabase && user) {
      const { data } = await supabase
        .from("reviews")
        .insert({
          product_slug: input.productSlug,
          user_id: user.id,
          author: input.author,
          rating: input.rating,
          title: input.title,
          body: input.body,
        })
        .select()
        .single();
      if (data) return mapCloudReview(data as CloudReview);
    }

    // 本地降级
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
