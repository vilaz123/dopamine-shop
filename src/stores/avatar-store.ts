"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";
import type { AvatarState, AvatarMood } from "@/types/avatar";
import { storageKeys } from "@/lib/utils/storage";
import { getSupabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { virtualCalories } from "@/lib/data/avatar-calories";
import { computeMood, decaySatiety, hungerFromSatiety, weightFromCalories, clamp, clampWeight } from "@/lib/avatar/avatar-mood";

const BASE_WEIGHT = 1;

const initialAvatar: AvatarState = {
  name: "小多",
  color: "#FF3D81",
  hunger: 30,
  satiety: 70,
  calories: 0,
  weight: BASE_WEIGHT,
  mood: "content",
  wardrobe: [],
  lastFedAt: "",
  lastInteractedAt: "",
  created: false,
};

type AvatarStore = AvatarState & {
  /** 建分身（首次）。 */
  createAvatar: (name: string, color: string) => void;
  /** 喂食：仅食物。返回本次卡路里（供 UI 飞金币）。 */
  feed: (product: Product) => number;
  /** 穿戴：仅服饰。 */
  wear: (slug: string) => void;
  /** 重置形体/卡路里，保留分身。 */
  resetShape: () => void;
  /** 按当前时间重算 hunger/satiety/mood（纯派生，组件挂载/聚焦时调）。 */
  recompute: () => void;
  setMood: (mood: AvatarMood) => void;
};

/** 把分身状态同步到云端 avatars 表（fire-and-forget，失败静默）。 */
function syncAvatarToCloud(state: AvatarState) {
  const supabase = getSupabase();
  const user = useAuthStore.getState().user;
  if (!supabase || !user) return;
  void supabase
    .from("avatars")
    .upsert(
      {
        user_id: user.id,
        name: state.name,
        color: state.color,
        hunger: state.hunger,
        satiety: state.satiety,
        calories: state.calories,
        weight: state.weight,
        mood: state.mood,
        wardrobe: state.wardrobe,
        last_fed_at: state.lastFedAt || null,
        last_interacted_at: state.lastInteractedAt || null,
      },
      { onConflict: "user_id" },
    )
    .then(() => undefined);
}

/** 派生当前 satiety/hunger（按时间衰减）。 */
function derive(state: AvatarState, now = Date.now()): { satiety: number; hunger: number } {
  const sinceMs = state.lastFedAt ? now - new Date(state.lastFedAt).getTime() : 0;
  const satiety = state.lastFedAt ? decaySatiety(state.satiety, sinceMs) : state.satiety;
  return { satiety, hunger: hungerFromSatiety(satiety) };
}

export const useAvatarStore = create<AvatarStore>()(
  persist(
    (set, get) => ({
      ...initialAvatar,

      createAvatar: (name, color) =>
        set(() => {
          const now = new Date().toISOString();
          const state: AvatarState = {
            ...initialAvatar,
            name: name.trim() || "小多",
            color: color || initialAvatar.color,
            created: true,
            lastFedAt: now,
            lastInteractedAt: now,
          };
          syncAvatarToCloud(state);
          return state;
        }),

      feed: (product) => {
        const cal = virtualCalories(product);
        if (cal <= 0) return 0;
        const prev = get();
        if (!prev.created) return 0;
        const now = new Date().toISOString();
        const { satiety: decayed } = derive(prev);
        const satiety = clamp(decayed + 28); // 一份约 +28 饱腹
        const calories = prev.calories + cal;
        const state: AvatarState = {
          ...prev,
          satiety,
          hunger: hungerFromSatiety(satiety),
          calories,
          weight: clampWeight(weightFromCalories(calories)),
          mood: computeMood({ ...prev, satiety, hunger: hungerFromSatiety(satiety), calories, weight: clampWeight(weightFromCalories(calories)) }, "feed"),
          lastFedAt: now,
          lastInteractedAt: now,
        };
        syncAvatarToCloud(state);
        set(state);
        return cal;
      },

      wear: (slug) =>
        set((state) => {
          if (!state.created) return state;
          const wardrobe = state.wardrobe.includes(slug) ? state.wardrobe : [...state.wardrobe, slug];
          const next: AvatarState = {
            ...state,
            wardrobe,
            mood: computeMood(state, "wear"),
            lastInteractedAt: new Date().toISOString(),
          };
          syncAvatarToCloud(next);
          return next;
        }),

      resetShape: () =>
        set((state) => {
          if (!state.created) return state;
          const now = new Date().toISOString();
          const next: AvatarState = {
            ...state,
            calories: 0,
            weight: BASE_WEIGHT,
            satiety: 70,
            hunger: 30,
            mood: computeMood({ ...state, calories: 0, weight: BASE_WEIGHT }, "reset"),
            lastInteractedAt: now,
          };
          syncAvatarToCloud(next);
          return next;
        }),

      recompute: () =>
        set((state) => {
          if (!state.created) return state;
          const { satiety, hunger } = derive(state);
          if (satiety === state.satiety && hunger === state.hunger) return state; // 无变化不写
          const next: AvatarState = { ...state, satiety, hunger, mood: computeMood({ ...state, satiety, hunger }) };
          return next; // 派生重算不触发云写（仅稳态），避免高频写
        }),

      setMood: (mood) => set({ mood }),
    }),
    { name: storageKeys.avatar },
  ),
);
