import type { AvatarShape } from "@/types/avatar";

/** 分身形象卡：形状×身体状态×精神状态 → 静态图路径。 */

export type BodyState =
  | "emaciated" | "thin" | "normal" | "stuffed"
  | "chubby" | "fat" | "obese" | "muscular" | "sick" | "pig";
export type SpiritState = "energetic" | "ok" | "tired" | "happy" | "sad" | "sleeping";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 由 weight/satiety/calories/精神 决定身体状态。 */
export function bodyFromState(weight: number, satiety: number, calories: number, spirit: number, dopamine: number, endorphin: number): BodyState {
  // 健壮：多巴胺+内啡肽双高 且 体重适中（常互动+好心情=运动型）
  if (dopamine >= 70 && endorphin >= 70 && weight >= 0.95 && weight <= 1.12 && calories > 600) return "muscular";
  // 极胖 → 变猪
  if (weight > 1.4 && calories > 5000) return "pig";
  // 极胖但还没变猪
  if (weight > 1.32) return "obese";
  if (weight > 1.2) return "fat";
  if (weight > 1.08) return "chubby";
  // 吃太撑且精神低 → 难受（吃撑了又累，闹肚子）
  if (satiety >= 95 && spirit < 35) return "sick";
  if (satiety >= 92) return "stuffed";
  if (calories < 300 && weight < 0.92) return "emaciated"; // 卡路里太低·面黄肌瘦
  if (weight < 0.9) return "thin"; // 微饿/瘦
  return "normal";
}

/** 由 spirit/mood 决定精神面貌。sleeping=精神极低；happy=多巴胺高。 */
export function spiritFromState(body: BodyState, spirit: number, dopamine: number, mood: string): SpiritState {
  if (spirit < 12) return "sleeping"; // 精神极低 → 睡着
  if (body === "sick" || body === "emaciated") return "sad";
  if (spirit < 25) return "tired";
  if (mood === "excited" || (dopamine >= 78 && spirit >= 60)) return "happy";
  if (mood === "worried") return "sad";
  if (spirit > 75) return "energetic";
  return "ok";
}

/** 图文件名映射 + 缺失回退到最近已生图（避免 404 直接走 SVG，能用图就先用图）。 */
// 已生图 stem 全集（按 shape），由 scripts/gen-avatar-ai.mjs 生成；未命中时按精神/body 回退。
const LOOKS_BY_SHAPE: Record<AvatarShape, Set<string>> = {
  human: new Set(["human-emaciated-ok","human-emaciated-sad","human-emaciated-sleeping","human-thin-ok","human-thin-tired","human-normal-energetic","human-normal-happy","human-normal-ok","human-normal-sad","human-normal-sleeping","human-normal-tired","human-stuffed-ok","human-stuffed-happy","human-stuffed-sad","human-chubby-ok","human-chubby-happy","human-chubby-tired","human-chubby-sleeping","human-fat-ok","human-fat-happy","human-fat-tired","human-obese-sad","human-obese-tired","human-muscular-energetic","human-muscular-happy","human-sick-sad","human-sick-sleeping"]),
  cat: new Set(["cat-emaciated-ok","cat-emaciated-sad","cat-emaciated-sleeping","cat-thin-ok","cat-thin-tired","cat-normal-energetic","cat-normal-happy","cat-normal-ok","cat-normal-sad","cat-normal-sleeping","cat-normal-tired","cat-stuffed-ok","cat-stuffed-happy","cat-stuffed-sad","cat-chubby-ok","cat-chubby-happy","cat-chubby-tired","cat-chubby-sleeping","cat-fat-ok","cat-fat-happy","cat-fat-tired","cat-obese-sad","cat-obese-tired","cat-muscular-energetic","cat-muscular-happy","cat-sick-sad","cat-sick-sleeping"]),
  bunny: new Set(["bunny-emaciated-ok","bunny-emaciated-sad","bunny-emaciated-sleeping","bunny-thin-ok","bunny-thin-tired","bunny-normal-energetic","bunny-normal-happy","bunny-normal-ok","bunny-normal-sad","bunny-normal-sleeping","bunny-normal-tired","bunny-stuffed-ok","bunny-stuffed-happy","bunny-stuffed-sad","bunny-chubby-ok","bunny-chubby-happy","bunny-chubby-tired","bunny-chubby-sleeping","bunny-fat-ok","bunny-fat-happy","bunny-fat-tired","bunny-obese-sad","bunny-obese-tired","bunny-muscular-energetic","bunny-muscular-happy","bunny-sick-sad","bunny-sick-sleeping"]),
};
const PIG_LOOKS = new Set(["pig-ok","pig-happy","pig-tired"]);
const SPIRIT_FALLBACK = ["ok","tired","happy","sad","energetic","sleeping"];

function resolveFile(shape: AvatarShape, body: BodyState, sp: SpiritState): string {
  if (body === "pig") {
    if (PIG_LOOKS.has(`pig-${sp}`)) return `pig-${sp}`;
    if (sp === "sleeping" || sp === "tired" || sp === "sad") return "pig-tired";
    if (sp === "happy") return "pig-happy";
    return "pig-ok";
  }
  const set = LOOKS_BY_SHAPE[shape] ?? LOOKS_BY_SHAPE.human;
  const primary = `${shape}-${body}-${sp}`;
  if (set.has(primary)) return primary;
  // 精神回退：按 SPIRIT_FALLBACK 找同 body 的其它精神图
  for (const s of SPIRIT_FALLBACK) {
    const f = `${shape}-${body}-${s}`;
    if (set.has(f)) return f;
  }
  // body 回退：同精神找正常体型
  if (set.has(`${shape}-normal-${sp}`)) return `${shape}-normal-${sp}`;
  if (set.has(`${shape}-normal-ok`)) return `${shape}-normal-ok`;
  return primary; // 实在没图，让 img onError 回退 SVG
}

/** 决定显示哪张形象图 + 描述。 */
export function avatarLook(
  shape: AvatarShape,
  weight: number,
  satiety: number,
  calories: number,
  spirit: number,
  dopamine = 50,
  endorphin = 50,
  mood = "content",
): { src: string; alt: string; body: BodyState; spiritState: SpiritState } {
  const body = bodyFromState(weight, satiety, calories, spirit, dopamine, endorphin);
  const spiritState = spiritFromState(body, spirit, dopamine, mood);
  const file = resolveFile(shape, body, spiritState);
  const bodyLabel: Record<BodyState, string> = {
    emaciated: "面黄肌瘦", thin: "微饿清瘦", normal: "正常", stuffed: "吃太撑",
    chubby: "微胖", fat: "超胖", obese: "极度肥胖", muscular: "健壮", sick: "吃撑难受", pig: "变成猪",
  };
  const spiritLabel: Record<SpiritState, string> = {
    energetic: "精神饱满", ok: "正常", tired: "疲惫无神", happy: "开心", sad: "难过", sleeping: "睡着了",
  };
  return {
    src: `${BASE_PATH}/avatars/${file}.webp`,
    alt: `${shape} 分身，${bodyLabel[body]}、${body === "pig" ? "" : spiritLabel[spiritState] + "、"}可爱写实形象`,
    body,
    spiritState,
  };
}
