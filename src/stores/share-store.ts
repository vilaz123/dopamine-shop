"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/lib/utils/storage";
import type { ShareItem } from "@/types/share";

function makeCode() {
  return `DOPA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

type ShareState = {
  shares: ShareItem[];
  createShare: (input: Omit<ShareItem, "code" | "createdAt" | "openedCount">) => ShareItem;
  markOpened: (code: string) => void;
};

export const useShareStore = create<ShareState>()(
  persist(
    (set) => ({
      shares: [],
      createShare: (input) => {
        const item: ShareItem = { ...input, code: makeCode(), createdAt: new Date().toISOString(), openedCount: 0 };
        set((state) => ({ shares: [item, ...state.shares].slice(0, 80) }));
        return item;
      },
      markOpened: (code) => set((state) => ({ shares: state.shares.map((share) => share.code === code ? { ...share, openedCount: share.openedCount + 1 } : share) })),
    }),
    { name: storageKeys.shares },
  ),
);
