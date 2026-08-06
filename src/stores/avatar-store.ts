"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";
import type { AvatarState, AvatarMood } from "@/types/avatar";
import { storageKeys } from "@/lib/utils/storage";
import { getSupabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { virtualCalories } from "@/lib/data/avatar-calories";
import { computeMood, decaySatiety, decaySpirit, decaySlow, hungerFromSatiety, weightFromCalories, clamp, clampWeight } from "@/lib/avatar/avatar-mood";

const BASE_WEIGHT = 1;

const initialAvatar: AvatarState = {
  name: "小多",
  color: "#FF3D81",
  shape: "human",
  hunger: 30,
  satiety: 70,
  calories: 0,
  weight: BASE_WEIGHT,
  dopamine: 50,
  endorphin: 50,
  spirit: 80,
  mood: "content",
  wardrobe: [],
  lastFedAt: "",
  lastInteractedAt: "",
  created: false,
};

type AvatarStore = AvatarState & {
  /** 建分身（首次）。 */
  createAvatar: (name: string, color: string, shape: AvatarState["shape"]) => void;
  /** 喂食：仅食物。返回本次卡路里（供 UI 飞金币）。 */
  feed: (product: Product) => number;
  /** 穿戴：仅服饰。 */
  wear: (slug: string) => void;
  /** 重置形体/卡路里，保留分身。 */
  resetShape: () => void;
  /** 按当前时间重算 hunger/satiety/dopamine/endorphin/spirit/mood（纯派生，组件挂载/聚焦时调）。 */
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
        shape: state.shape,
        hunger: state.hunger,
        satiety: state.satiety,
        calories: state.calories,
        weight: state.weight,
        dopamine: state.dopamine,
        endorphin: state.endorphin,
        spirit: state.spirit,
        mood: state.mood,
        wardrobe: state.wardrobe,
        last_fed_at: state.lastFedAt || null,
        last_interacted_at: state.lastInteractedAt || null,
      },
      { onConflict: "user_id" },
    )
    .then(() => undefined);
}

/** 派生按时间衰减后的状态。satiety/spirit/dopamine/endorphin 都随 lastInteractedAt 衰减。 */
function derive(state: AvatarState, now = Date.now()): { satiety: number; hunger: number; spirit: number; dopamine: number; endorphin: number } {
  const sinceMs = state.lastInteractedAt ? now - new Date(state.lastInteractedAt).getTime() : 0;
  const fedSince = state.lastFedAt ? now - new Date(state.lastFedAt).getTime() : 0;
  const satiety = state.lastFedAt ? decaySatiety(state.satiety, fedSince) : state.satiety;
  const spirit = state.lastInteractedAt ? decaySpirit(state.spirit, sinceMs) : state.spirit;
  const dopamine = state.lastInteractedAt ? decaySlow(state.dopamine, sinceMs) : state.dopamine;
  const endorphin = state.lastInteractedAt ? decaySlow(state.endorphin, sinceMs) : state.endorphin;
  return { satiety, hunger: hungerFromSatiety(satiety), spirit, dopamine, endorphin };
}

export const useAvatarStore = create<AvatarStore>()(
  persist(
    (set, get) => ({
      ...initialAvatar,

      createAvatar: (name, color, shape) =>
        set(() => {
          const now = new Date().toISOString();
          const state: AvatarState = {
            ...initialAvatar,
            name: name.trim() || "小多",
            color: color || initialAvatar.color,
            shape: shape || "human",
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
        const { satiety: decayedSat, spirit: decayedSpirit, dopamine: decayedDop } = derive(prev);
        const satiety = clamp(decayedSat + 28); // 一份约 +28 饱腹
        const calories = prev.calories + cal;
        const weight = clampWeight(weightFromCalories(calories));
        const dopamine = clamp(decayedDop + 12); // 喂食加多巴胺
        const spirit = clamp(decayedSpirit + 10); // 喂食回精神
        const hunger = hungerFromSatiety(satiety);
        const state: AvatarState = {
          ...prev,
          satiety,
          hunger,
          calories,
          weight,
          dopamine,
          spirit,
          mood: computeMood({ ...prev, satiety, hunger, calories, weight, dopamine, spirit }, "feed"),
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
          const { spirit: dSpirit, dopamine: dDop, endorphin: dEnd } = derive(state);
          const wardrobe = state.wardrobe.includes(slug) ? state.wardrobe : [...state.wardrobe, slug];
          const next: AvatarState = {
            ...state,
            wardrobe,
            dopamine: clamp(dDop + 6),
            endorphin: clamp(dEnd + 15), // 穿戴加内啡肽
            spirit: clamp(dSpirit + 6),
            mood: computeMood({ ...state, dopamine: clamp(dDop + 6), endorphin: clamp(dEnd + 15), spirit: clamp(dSpirit + 6) }, "wear"),
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
          const { satiety, hunger, spirit, dopamine, endorphin } = derive(state);
          if (satiety === state.satiety && hunger === state.hunger && spirit === state.spirit && dopamine === state.dopamine && endorphin === state.endorphin) return state;
          const next: AvatarState = { ...state, satiety, hunger, spirit, dopamine, endorphin, mood: computeMood({ ...state, satiety, hunger, spirit, dopamine, endorphin }) };
          return next; // 派生重算不触发云写（仅稳态），避免高频写
        }),

      setMood: (mood) => set({ mood }),
    }),
    { name: storageKeys.avatar },
  ),
);
