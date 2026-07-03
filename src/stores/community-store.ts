"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seededCommunityPosts } from "@/lib/data/community-posts";
import { storageKeys } from "@/lib/utils/storage";
import type { CommunityComment, CommunityPost } from "@/types/community";

type CommunityState = {
  posts: CommunityPost[];
  addPost: (post: Omit<CommunityPost, "id" | "likes" | "comments" | "createdAt">) => void;
  likePost: (id: string) => void;
  addComment: (postId: string, comment: Omit<CommunityComment, "id" | "createdAt">) => void;
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      posts: seededCommunityPosts,
      addPost: (post) => set((state) => ({ posts: [{ ...post, id: `post-${Date.now().toString(36)}`, likes: 0, comments: [], createdAt: new Date().toISOString() }, ...state.posts] })),
      likePost: (id) => set((state) => ({ posts: state.posts.map((post) => post.id === id ? { ...post, likes: post.likes + 1 } : post) })),
      addComment: (postId, comment) => set((state) => ({ posts: state.posts.map((post) => post.id === postId ? { ...post, comments: [{ ...comment, id: `comment-${Date.now().toString(36)}`, createdAt: new Date().toISOString() }, ...post.comments] } : post) })),
    }),
    { name: storageKeys.community },
  ),
);
