"use client";

import { create } from "zustand";
import { getSupabase } from "@/lib/supabase/client";

export type LeaderboardRow = {
  user_id: string;
  username: string | null;
  avatar_color: string | null;
  saved: number;
  calories: number;
  coins: number;
  restraints: number;
  streak: number;
};

export type LeaderboardScope = "today" | "all";

type LeaderboardState = {
  rows: LeaderboardRow[];
  loading: boolean;
  loaded: boolean;
  load: (scope: LeaderboardScope) => Promise<void>;
};

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  load: async (scope) => {
    const supabase = getSupabase();
    if (!supabase) {
      set({ rows: [], loaded: true });
      return;
    }
    set({ loading: true });
    const { data, error } = await supabase.rpc("daily_leaderboard", { p_mode: scope });
    if (error || !data) {
      set({ loading: false, loaded: true });
      return;
    }
    set({ rows: data as LeaderboardRow[], loading: false, loaded: true });
  },
}));
