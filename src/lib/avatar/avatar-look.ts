import type { AvatarShape } from "@/types/avatar";

/** 分身形象卡：形状×身体状态×精神状态 → 静态图路径。 */

export type BodyState = "emaciated" | "thin" | "normal" | "stuffed" | "chubby" | "fat" | "pig";
export type SpiritState = "energetic" | "ok" | "tired";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 由 weight/satiety/calories 决定身体状态。 */
export function bodyFromState(weight: number, satiety: number, calories: number): BodyState {
  if (calories < 300 && weight < 0.92) return "emaciated"; // 卡路里太低·人面黄肌瘦干尸形
  if (weight > 1.4 && calories > 5000) return "pig"; // 超胖 → 变猪
  if (weight > 1.2) return "fat";
  if (weight > 1.08) return "chubby";
  if (satiety >= 92) return "stuffed";
  if (weight < 0.9) return "thin"; // 微饿/瘦
  return "normal";
}

/** 由 spirit 决定精神面貌（仅 normal 身体区分；其他身体统一 ok）。 */
export function spiritFromState(body: BodyState, spirit: number): SpiritState {
  if (body !== "normal") return "ok";
  if (spirit < 25) return "tired";
  if (spirit > 75) return "energetic";
  return "ok";
}

/** 决定显示哪张形象图 + 描述。 */
export function avatarLook(
  shape: AvatarShape,
  weight: number,
  satiety: number,
  calories: number,
  spirit: number,
): { src: string; alt: string; body: BodyState; spiritState: SpiritState } {
  const body = bodyFromState(weight, satiety, calories);
  const spiritState = spiritFromState(body, spirit);
  // pig 形态不分 shape，统一一张
  const file = body === "pig" ? "pig-ok" : `${shape}-${body}-${spiritState}`;
  const bodyLabel: Record<BodyState, string> = {
    emaciated: "面黄肌瘦",
    thin: "微饿清瘦",
    normal: "正常",
    stuffed: "吃太撑",
    chubby: "微胖",
    fat: "超胖",
    pig: "变成猪",
  };
  const spiritLabel: Record<SpiritState, string> = { energetic: "精神饱满", ok: "正常", tired: "疲惫无神" };
  return {
    src: `${BASE_PATH}/avatars/${file}.webp`,
    alt: `${shape} 分身，${bodyLabel[body]}、${body === "pig" ? "" : spiritLabel[spiritState] + "、"}可爱写实形象`,
    body,
    spiritState,
  };
}
