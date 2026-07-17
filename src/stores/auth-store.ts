"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/lib/utils/storage";
import { getSupabase } from "@/lib/supabase/client";
import type { MockUser, ShippingProfile } from "@/types/user";

type AuthState = {
  user: MockUser | null;
  /** 本地降级模式下的 mock 用户注册表（仅未配置 Supabase 时使用）。 */
  users: Record<string, MockUser>;
  setUserFromSession: (user: MockUser | null) => void;
  /** 未配置 Supabase 时的本地降级登录。 */
  mockEmailSignIn: (email: string, username?: string) => MockUser;
  updateProfile: (input: { username: string; shipping?: ShippingProfile }) => void;
  logout: () => Promise<void>;
};

function mockIdFromEmail(email: string) {
  return `mock-${email.trim().toLowerCase()}`;
}

function defaultUsernameFromEmail(email: string) {
  return `仓友${email.split("@")[0].slice(-4) || "仓友"}`;
}

/**
 * updateProfile 触发的 profiles upsert：只写展示型字段，
 * 不触碰 coins/xp/badges/coupons（由 AccountSync 的云同步层维护），
 * 避免覆盖云端资产。
 */
async function upsertProfileDisplay(user: MockUser) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      username: user.username,
      avatar_color: user.avatarColor,
      phone: user.phone ?? null,
      email: user.email ?? null,
      onboarded: user.onboarded,
      shipping: user.shipping ?? null,
    },
    { onConflict: "id" },
  );
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: {},

      setUserFromSession: (user) => set({ user }),

      mockEmailSignIn: (email, username) => {
        const id = mockIdFromEmail(email);
        const existing = get().users[id];
        const user: MockUser =
          existing ?? {
            id,
            email: email.trim(),
            username: username?.trim() || defaultUsernameFromEmail(email),
            avatarColor: "#FF3D81",
            createdAt: new Date().toISOString(),
            onboarded: false,
          };
        set((state) => ({ user, users: { ...state.users, [id]: user } }));
        return user;
      },

      updateProfile: ({ username, shipping }) =>
        set((state) => {
          if (!state.user) return state;
          const user: MockUser = { ...state.user, username, shipping, onboarded: true };
          // 云端 upsert 走 fire-and-forget，不阻塞 UI。
          void upsertProfileDisplay(user);
          return { user, users: { ...state.users, [user.id]: user } };
        }),

      logout: async () => {
        const supabase = getSupabase();
        if (supabase) await supabase.auth.signOut();
        // 实际 user 清空交由 onAuthStateChange(SIGNED_OUT) 处理；
        // 未配置云端时这里直接清空兜底。
        if (!supabase) set({ user: null });
      },
    }),
    { name: storageKeys.auth },
  ),
);
