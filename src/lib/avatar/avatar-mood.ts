import type { AvatarMood, AvatarState } from "@/types/avatar";

/**
 * 分身心情状态机 + 反馈台词池（规则驱动，A 档）。
 * 输入当前状态与"刚发生的事件"，输出心情 + 一句台词（调用方随机取）。
 * 台词保持戏谑轻松、明确虚拟可逆，不碰真实身材焦虑。
 */

export type AvatarEvent = "feed" | "wear" | "reset" | "idle";

const lines: Record<AvatarMood, string[]> = {
  stuffed: ["吃撑了…扶我一下", "再也吃不下了，真的", "腰带（虚拟的）要崩了"],
  hungry: ["好饿啊…还有吃的吗", "肚子在叫了，你听到了吗", "饿到想吃屏幕"],
  worried: ["最近好像胖了…有点烦恼", "裤子紧了（虚拟的裤子）", "照了照虚拟镜子，陷入沉思"],
  excited: ["这件好看！我穿了", "感觉精神多了", "穿上这件，今天稳了"],
  happy: ["今天也很满足", "有你喂我真好", "状态不错，继续保持"],
  content: ["嗯，刚刚好", "不饿不撑，舒服", "就这样挺好"],
};

/** 随机取一句，避免每次同一心情台词不变。调用方传入 index 以便确定性（可选）。 */
export function pickLine(mood: AvatarMood, randomIndex?: number): string {
  const pool = lines[mood];
  const i = randomIndex != null ? randomIndex % pool.length : Math.floor(Math.random() * pool.length);
  return pool[i];
}

/**
 * 计算心情。优先级：刚穿 > 吃撑 > 饿 > 烦恼(胖) > 默认。
 * justEvent 触发瞬时心情，否则按稳态 hunger/satiety/weight 判。
 */
export function computeMood(state: AvatarState, justEvent: AvatarEvent = "idle"): AvatarMood {
  if (justEvent === "wear") return "excited";
  if (justEvent === "reset") return "happy";
  if (justEvent === "feed") {
    return state.satiety >= 90 ? "stuffed" : "happy";
  }
  // 稳态
  if (state.hunger >= 80) return "hungry";
  if (state.weight > 1.18 && state.calories > 2500) return "worried";
  if (state.satiety >= 90) return "stuffed";
  if (state.hunger >= 55) return "hungry";
  return state.satiety >= 40 ? "content" : "happy";
}

/** 饱腹随时间衰减：每小时降 8（约 12 小时从满到 0）。返回新 satiety（0-100）。 */
export function decaySatiety(satiety: number, sinceMs: number): number {
  const hours = sinceMs / 3_600_000;
  return clamp(satiety - hours * 8);
}

/** 从饱腹反推饥饿：hunger = 100 - satiety（互补，简单可读）。 */
export function hungerFromSatiety(satiety: number): number {
  return clamp(100 - satiety);
}

/** 卡路里→形态权重：每 2000 虚拟卡路里约 +0.1 体重，下限 0.7 上限 1.6。 */
export function weightFromCalories(calories: number): number {
  return clampWeight(1 + calories / 20000);
}

export function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}
export function clampWeight(w: number): number {
  return Math.max(0.7, Math.min(1.6, Math.round(w * 100) / 100));
}
