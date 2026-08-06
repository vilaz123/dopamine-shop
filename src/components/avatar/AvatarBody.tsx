"use client";

import type { AvatarMood } from "@/types/avatar";

/**
 * 参数化 SVG 分身人形：体重(weight)驱动身宽胖瘦，心情(mood)换表情。
 * 照站内 RiderMapMock 套路：viewBox 等比缩放 + CSS 变量配色，静态导出可跑。
 * weight 0.7-1.6 → 身体宽度缩放，肉眼可见胖瘦。
 */
const moodFace: Record<AvatarMood, { eyes: string; mouth: string; emoji: string }> = {
  happy: { eyes: "◠ ◡", mouth: "◡", emoji: "😊" },
  content: { eyes: "· ·", mouth: "‿", emoji: "🙂" },
  stuffed: { eyes: "× ×", mouth: "o", emoji: "🤢" },
  hungry: { eyes: "0 0", mouth: "⌓", emoji: "🍽️" },
  worried: { eyes: "· ·", mouth: "⌒", emoji: "😟" },
  excited: { eyes: "★ ★", mouth: "◡", emoji: "✨" },
};

export function AvatarBody({ weight = 1, mood = "content", color = "#FF3D81", size = 220 }: { weight?: number; mood?: AvatarMood; color?: string; size?: number }) {
  // 体重映射到身体椭圆宽：1.0=标准(36)，1.6=胖(54)，0.7=瘦(26)
  const bodyW = 36 * weight;
  const bodyH = 46; // 高度恒定，只横向变
  const face = moodFace[mood];
  // 心情影响身体颜色饱和度：worried/stuffed 略灰，excited/happy 更亮
  const dim = mood === "worried" || mood === "stuffed" ? 0.85 : mood === "excited" || mood === "happy" ? 1.05 : 1;
  const skin = color;
  const skinShade = `color-mix(in srgb, ${color} ${Math.round(80 * dim)}%, white)`;

  return (
    <svg viewBox="0 0 100 120" width={size} height={(size * 120) / 100} role="img" aria-label={`分身，心情${mood}`}>
      {/* 头 */}
      <ellipse cx="50" cy="24" rx="16" ry="15" fill={skinShade} stroke={skin} strokeWidth="1.4" />
      {/* 眼 + 嘴（文字当表情，简单可读） */}
      <text x="43" y="22" fontSize="6" textAnchor="middle" dominantBaseline="central">{face.eyes.split(" ")[0]}</text>
      <text x="57" y="22" fontSize="6" textAnchor="middle" dominantBaseline="central">{face.eyes.split(" ")[1]}</text>
      <text x="50" y="30" fontSize="6" textAnchor="middle" dominantBaseline="central">{face.mouth}</text>
      {/* 身体椭圆：宽度随 weight */}
      <ellipse cx="50" cy="74" rx={bodyW / 2} ry={bodyH / 2} fill={skinShade} stroke={skin} strokeWidth="1.4" />
      {/* 腿 */}
      <line x1="42" y1="96" x2="42" y2="112" stroke={skin} strokeWidth="4" strokeLinecap="round" />
      <line x1="58" y1="96" x2="58" y2="112" stroke={skin} strokeWidth="4" strokeLinecap="round" />
      {/* 手 */}
      <line x1={50 - bodyW / 2 - 4} y1="66" x2={50 - bodyW / 2 - 10} y2="80" stroke={skin} strokeWidth="3.5" strokeLinecap="round" />
      <line x1={50 + bodyW / 2 + 4} y1="66" x2={50 + bodyW / 2 + 10} y2="80" stroke={skin} strokeWidth="3.5" strokeLinecap="round" />
      {/* 心情角标 */}
      <text x="72" y="20" fontSize="10" textAnchor="middle" dominantBaseline="central">{face.emoji}</text>
    </svg>
  );
}
