"use client";

import { useEffect, useState } from "react";
import type { Review } from "@/types/review";
import { reviewService } from "@/lib/services";
import { useAssetStore } from "@/stores/asset-store";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function ReviewSection({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const user = useAuthStore((state) => state.user);
  const [author, setAuthor] = useState(user?.username ?? "匿名仓友");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const setLastReward = useUiStore((state) => state.setLastReward);

  useEffect(() => {
    reviewService.listByProduct(productSlug).then(setReviews);
  }, [productSlug]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const review = await reviewService.add({ productSlug, rating, title, body, author });
    grantCoins(20);
    setLastReward({ id: `review-${Date.now()}`, coins: 20 });
    setReviews((current) => [{ ...review, coinsEarned: 20 }, ...current]);
    setTitle("");
    setBody("");
  }

  return (
    <section className="mt-20 border-t border-black/10 pt-12">
      <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#FF3D81]">Showcase</p>
          <h2 className="font-display mt-3 text-5xl">晒单评论</h2>
          <form onSubmit={submit} className="mt-8 space-y-4 rounded-[2rem] bg-[#FFFFFF] p-6">
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="你的名字" />
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="晒单标题" />
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="追评、吐槽、五星好评都可以。" rows={4} />
            <label className="block text-sm text-[#5A4A6A]">满足感：{rating}/5</label>
            <input type="range" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full" />
            <Button type="submit" className="w-full">发布晒单领取 +20 多巴胺币</Button>
          </form>
        </div>
        <div className="space-y-5">
          {reviews.length === 0 ? <p className="text-[#5A4A6A]">还没有晒单。</p> : reviews.map((review) => (
            <article key={review.id} className="rounded-[2rem] border border-black/10 bg-white/45 p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-3xl">{review.title}</h3>
                <span className="text-sm text-[#FF3D81]">{"★".repeat(review.rating)}</span>
              </div>
              <p className="mt-3 leading-7 text-[#3D3357]">{review.body}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#5A4A6A]">{review.author} · +{review.coinsEarned ?? 20} 币</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
