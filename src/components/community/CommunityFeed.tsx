"use client";

import { useEffect, useState } from "react";
import { communityTopics } from "@/lib/data/community-posts";
import { products } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils/format";
import { useAssetStore } from "@/stores/asset-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCommunityStore } from "@/stores/community-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function CommunityFeed() {
  const posts = useCommunityStore((state) => state.posts);
  const loadPosts = useCommunityStore((state) => state.loadPosts);
  const addPost = useCommunityStore((state) => state.addPost);
  const likePost = useCommunityStore((state) => state.likePost);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const user = useAuthStore((state) => state.user);
  const [topic, setTopic] = useState(communityTopics[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState(user?.username ?? "匿名仓友");

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    void addPost({ author, title, body, topic, relatedProductSlugs: [], savedAmount: 0 });
    grantCoins(30);
    setLastReward({ id: `community-${Date.now()}`, coins: 30 });
    setTitle("");
    setBody("");
  }

  const filtered = posts.filter((post) => post.topic === topic);

  return (
    <div className="grid gap-6 sm:gap-10 lg:grid-cols-[360px_1fr]">
      <aside>
        <form onSubmit={submit} className="rounded-[2rem] bg-white p-6">
          <h2 className="font-display text-3xl sm:text-4xl">发布战利品</h2>
          <Input className="mt-5" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="昵称" />
          <Input className="mt-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" />
          <Textarea className="mt-3" rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="今天省下了什么？骑手还在路上吗？" />
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
            {communityTopics.map((item) => <option key={item}>{item}</option>)}
          </select>
          <Button className="mt-4 w-full" type="submit">发布并领取 +30 币</Button>
        </form>
        <div className="mt-6 flex flex-wrap gap-2">
          {communityTopics.map((item) => <button key={item} onClick={() => setTopic(item)} className={`rounded-full border px-3 py-2 text-sm ${topic === item ? "border-black bg-black text-[var(--bone)]" : "border-black/10"}`}>#{item}</button>)}
        </div>
      </aside>
      <div className="space-y-5">
        {filtered.map((post) => (
          <article key={post.id} className="rounded-[2rem] border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--hot)]">#{post.topic}</p>
            <h3 className="font-display mt-3 text-3xl sm:text-4xl">{post.title}</h3>
            <p className="mt-3 leading-7 text-[var(--muted)]">{post.body}</p>
            {post.relatedProductSlugs.length > 0 && <p className="mt-3 text-sm text-[var(--muted)]">关联商品：{post.relatedProductSlugs.map((slug) => products.find((p) => p.slug === slug)?.name).filter(Boolean).join("、")}</p>}
            {post.savedAmount > 0 && <p className="mt-2 text-sm text-[var(--hot)]">本次省下 {formatCurrency(post.savedAmount)}</p>}
            <div className="mt-5 flex items-center justify-between text-sm text-[var(--muted)]"><span>{post.author} · {new Date(post.createdAt).toLocaleDateString("zh-CN")}</span><button onClick={() => void likePost(post.id)}>👍 {post.likes}</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}
