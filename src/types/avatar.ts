/** AI 分身状态。A 档规则驱动：形态靠 weight，心情靠状态机，饥饿随时间。 */

export type AvatarMood = "happy" | "content" | "stuffed" | "hungry" | "worried" | "excited" | "tired";

export type AvatarShape = "human" | "cat" | "bunny";

export type AvatarState = {
  /** 分身昵称（默认 "小多"）。 */
  name: string;
  /** 分身主色（默认取账号 avatarColor）。 */
  color: string;
  /** 形状：人形 / 猫 / 兔。 */
  shape: AvatarShape;
  /** 饥饿度 0-100：0 饱、100 饿。派生自 satiety 与 lastFedAt 的时间衰减。 */
  hunger: number;
  /** 饱腹度 0-100：刚喂满 100，随时间下降。决定"吃撑"。 */
  satiety: number;
  /** 累计虚拟卡路里（喂食加，仅展示与驱动形态）。 */
  calories: number;
  /** 形态权重，初始 1.0；卡路里累计驱动增减，1.0=标准。 */
  weight: number;
  /** 多巴胺 0-100：加购/喂食 ↑，随时间缓降。整体情绪底色。 */
  dopamine: number;
  /** 内啡肽 0-100：穿戴 ↑，随时间缓降。"爽感"。 */
  endorphin: number;
  /** 精神 0-100：随时间降，喂食/穿戴回血；低了显累。 */
  spirit: number;
  /** 当前心情。 */
  mood: AvatarMood;
  /** 已穿戴/拥有的服饰 slug（去重）。 */
  wardrobe: string[];
  /** 最近一次喂食 ISO 时间。 */
  lastFedAt: string;
  /** 最近一次互动（喂/穿）ISO 时间。 */
  lastInteractedAt: string;
  /** 是否已建分身（区分"还没建"与"已建"）。 */
  created: boolean;
};
