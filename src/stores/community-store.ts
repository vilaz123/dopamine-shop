"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seededCommunityPosts } from "@/lib/data/community-posts";
import { storageKeys } from "@/lib/utils/storage";
import { getSupabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { CommunityComment, CommunityPost } from "@/types/community";

type CloudPost = {
  id: string;
  user_id: string;
  author: string | null;
  title: string | null;
  body: string | null;
  topic: string | null;
  related_slugs: string[] | null;
  saved_amount: number | null;
  likes_count: number | null;
  created_at: string;
};

function mapCloudPost(r: CloudPost): CommunityPost {
  return {
    id: r.id,
    author: r.author ?? "匿名仓友",
    title: r.title ?? "",
    body: r.body ?? "",
    topic: r.topic ?? "",
    relatedProductSlugs: r.related_slugs ?? [],
    savedAmount: r.saved_amount ?? 0,
    likes: r.likes_count ?? 0,
    comments: [],
    createdAt: r.created_at,
  };
}

// 云端 uuid 形如 xxxxxxxx-xxxx-... ，长度 36；本地 seed/临时 id 都不是
function isCloudId(id: string) {
  return id.length === 36 && id.charAt(8) === "-";
}

type CommunityState = {
  posts: CommunityPost[];
  loaded: boolean;
  loadPosts: () => Promise<void>;
  addPost: (post: Omit<CommunityPost, "id" | "likes" | "comments" | "createdAt">) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  addComment: (postId: string, comment: Omit<CommunityComment, "id" | "createdAt">) => Promise<void>;
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      posts: seededCommunityPosts,
      loaded: false,

      loadPosts: async () => {
        const supabase = getSupabase();
        if (!supabase) {
          set({ loaded: true });
          return;
        }
        const { data, error } = await supabase
          .from("community_posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (error || !data) {
          set({ loaded: true }); // 保留现有缓存
          return;
        }
        const cloud = (data as CloudPost[]).map(mapCloudPost);
        set((state) => {
          const ids = new Set(cloud.map((p) => p.id));
          const seeds = state.posts.filter((p) => p.id.startsWith("seed-") && !ids.has(p.id));
          return { posts: [...cloud, ...seeds], loaded: true };
        });
      },

      addPost: async (post) => {
        // 乐观本地插入（即时反馈）
        const tempId = `post-${Date.now().toString(36)}`;
        set((state) => ({
          posts: [
            { ...post, id: tempId, likes: 0, comments: [], createdAt: new Date().toISOString() },
            ...state.posts,
          ],
        }));

        const supabase = getSupabase();
        const user = useAuthStore.getState().user;
        if (!supabase || !user) return;

        const { data } = await supabase
          .from("community_posts")
          .insert({
            user_id: user.id,
            author: post.author,
            title: post.title,
            body: post.body,
            topic: post.topic,
            related_slugs: post.relatedProductSlugs,
            saved_amount: post.savedAmount,
          })
          .select()
          .single();
        if (data) {
          set((state) => ({
            posts: state.posts.map((p) => (p.id === tempId ? mapCloudPost(data as CloudPost) : p)),
          }));
        }
      },

      likePost: async (id) => {
        const supabase = getSupabase();
        if (supabase && isCloudId(id)) {
          const { data } = await supabase.rpc("toggle_like", { p_post: id });
          const liked = Boolean(data);
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === id ? { ...p, likes: Math.max(0, p.likes + (liked ? 1 : -1)) } : p,
            ),
          }));
          return;
        }
        // 本地/seed：单纯计数
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
        }));
      },

      addComment: async (postId, comment) => {
        const supabase = getSupabase();
        const user = useAuthStore.getState().user;
        if (supabase && user && isCloudId(postId)) {
          const { data } = await supabase
            .from("community_comments")
            .insert({ post_id: postId, user_id: user.id, author: comment.author, body: comment.body })
            .select()
            .single();
          if (data) {
            const c: CommunityComment = {
              id: data.id,
              author: data.author ?? comment.author,
              body: data.body ?? comment.body,
              createdAt: data.created_at,
            };
            set((state) => ({
              posts: state.posts.map((p) => (p.id === postId ? { ...p, comments: [c, ...p.comments] } : p)),
            }));
            return;
          }
        }
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [
                    { ...comment, id: `comment-${Date.now().toString(36)}`, createdAt: new Date().toISOString() },
                    ...p.comments,
                  ],
                }
              : p,
          ),
        }));
      },
    }),
    { name: storageKeys.community },
  ),
);
