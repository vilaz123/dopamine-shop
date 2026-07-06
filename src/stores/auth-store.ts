"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/lib/utils/storage";
import type { MockUser, ShippingProfile } from "@/types/user";

type AuthState = {
  user: MockUser | null;
  users: Record<string, MockUser>;
  pendingPhone: string | null;
  sendCode: (phone: string) => void;
  verifyCode: (code: string) => { ok: boolean; firstLogin: boolean };
  updateProfile: (input: { username: string; shipping?: ShippingProfile }) => void;
  logout: () => void;
};

function userIdFromPhone(phone: string) {
  return `mock-${phone.replace(/\D/g, "")}`;
}

function makeUser(phone: string): MockUser {
  return {
    id: userIdFromPhone(phone),
    phone,
    username: `仓友${phone.slice(-4)}`,
    avatarColor: "#ff4d6d",
    createdAt: new Date().toISOString(),
    onboarded: false,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: {},
      pendingPhone: null,
      sendCode: (phone) => set({ pendingPhone: phone }),
      verifyCode: (code) => {
        const phone = get().pendingPhone;
        if (!phone || code !== "123456") return { ok: false, firstLogin: false };
        const id = userIdFromPhone(phone);
        const existing = get().users[id];
        const user = existing ?? makeUser(phone);
        set((state) => ({ user, pendingPhone: null, users: { ...state.users, [id]: user } }));
        return { ok: true, firstLogin: !user.onboarded };
      },
      updateProfile: ({ username, shipping }) =>
        set((state) => {
          if (!state.user) return state;
          const user = { ...state.user, username, shipping, onboarded: true };
          return { user, users: { ...state.users, [user.id]: user } };
        }),
      logout: () => set({ user: null, pendingPhone: null }),
    }),
    { name: storageKeys.auth },
  ),
);
