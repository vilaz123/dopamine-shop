"use client";

import type { AvatarMood, AvatarShape } from "@/types/avatar";

/**
 * 可爱分身 SVG：支持人形/猫/兔，体重驱动胖瘦，心情换表情，服饰可见叠加。
 * 照站内 RiderMapMock 套路：viewBox 等比缩放，静态导出可跑。
 * weight 0.7-1.6 → 身体宽度缩放（横向变胖瘦，高度不变）。
 */

const moodFace: Record<AvatarMood, { eye: string; mouth: string; emoji: string }> = {
  happy: { eye: "◠", mouth: "◡", emoji: "😊" },
  content: { eye: "•", mouth: "‿", emoji: "🙂" },
  stuffed: { eye: "×", mouth: "o", emoji: "🤢" },
  hungry: { eye: "0", mouth: "⌓", emoji: "🍽️" },
  worried: { eye: "•", mouth: "⌒", emoji: "😟" },
  excited: { eye: "★", mouth: "◡", emoji: "✨" },
  tired: { eye: "-", mouth: "⌓", emoji: "😴" },
};

/** 决定画什么服饰。卫衣→身体色块；托特包→身侧包。 */
function outfitFor(wardrobe: string[]): { hoodie: boolean; tote: boolean } {
  return {
    hoodie: wardrobe.includes("chromatic-hoodie"),
    tote: wardrobe.includes("moon-archive-tote"),
  };
}

export function AvatarBody({
  weight = 1,
  mood = "content",
  color = "#FF3D81",
  shape = "human",
  wardrobe = [],
  size = 220,
  hoodieColor = "#A855F7",
}: {
  weight?: number;
  mood?: AvatarMood;
  color?: string;
  shape?: AvatarShape;
  wardrobe?: string[];
  size?: number;
  hoodieColor?: string;
}) {
  const bodyW = 36 * weight; // 体重驱动身宽
  const bodyH = 46;
  const face = moodFace[mood];
  const skin = color;
  const skinShade = `color-mix(in srgb, ${color} 82%, white)`;
  const { hoodie, tote } = outfitFor(wardrobe);

  return (
    <svg viewBox="0 0 100 124" width={size} height={(size * 124) / 100} role="img" aria-label={`分身 ${shape}，心情${mood}`}>
      {/* 形状特定耳朵 */}
      {shape === "cat" && (
        <>
          <polygon points="36,18 30,2 46,14" fill={skinShade} stroke={skin} strokeWidth="1.2" />
          <polygon points="64,18 70,2 54,14" fill={skinShade} stroke={skin} strokeWidth="1.2" />
          <polygon points="38,15 35,7 43,13" fill="#ffb6c1" />
          <polygon points="62,15 65,7 57,13" fill="#ffb6c1" />
        </>
      )}
      {shape === "bunny" && (
        <>
          <ellipse cx="40" cy="10" rx="5" ry="11" fill={skinShade} stroke={skin} strokeWidth="1.2" />
          <ellipse cx="60" cy="10" rx="5" ry="11" fill={skinShade} stroke={skin} strokeWidth="1.2" />
          <ellipse cx="40" cy="11" rx="2.4" ry="7" fill="#ffb6c1" />
          <ellipse cx="60" cy="11" rx="2.4" ry="7" fill="#ffb6c1" />
        </>
      )}

      {/* 头 */}
      <ellipse cx="50" cy="26" rx="17" ry="16" fill={skinShade} stroke={skin} strokeWidth="1.4" />
      {/* 猫胡须 */}
      {shape === "cat" && (
        <>
          <line x1="34" y1="26" x2="22" y2="24" stroke={skin} strokeWidth="0.8" />
          <line x1="34" y1="28" x2="22" y2="30" stroke={skin} strokeWidth="0.8" />
          <line x1="66" y1="26" x2="78" y2="24" stroke={skin} strokeWidth="0.8" />
          <line x1="66" y1="28" x2="78" y2="30" stroke={skin} strokeWidth="0.8" />
        </>
      )}
      {/* 大眼 */}
      <circle cx="43" cy="24" r="2.6" fill="#241A4D" />
      <circle cx="57" cy="24" r="2.6" fill="#241A4D" />
      <circle cx="43.8" cy="23.2" r="0.9" fill="white" />
      <circle cx="57.8" cy="23.2" r="0.9" fill="white" />
      {/* 嘴（mood 决定） */}
      <path d={mouthPath(face.mouth)} fill="none" stroke="#241A4D" strokeWidth="1.1" strokeLinecap="round" />

      {/* 身体 */}
      <ellipse cx="50" cy="76" rx={bodyW / 2} ry={bodyH / 2} fill={skinShade} stroke={skin} strokeWidth="1.4" />

      {/* 卫衣叠加：身体上一层卫衣色块 */}
      {hoodie && (
        <ellipse cx="50" cy="72" rx={bodyW / 2 - 1} ry={bodyH / 2 - 6} fill={hoodieColor} opacity="0.9" />
      )}

      {/* 腿 */}
      <line x1="42" y1="98" x2="42" y2="114" stroke={skin} strokeWidth="5" strokeLinecap="round" />
      <line x1="58" y1="98" x2="58" y2="114" stroke={skin} strokeWidth="5" strokeLinecap="round" />

      {/* 手 */}
      <circle cx={50 - bodyW / 2 - 3} cy="74" r="4" fill={skinShade} stroke={skin} strokeWidth="1.1" />
      <circle cx={50 + bodyW / 2 + 3} cy="74" r="4" fill={skinShade} stroke={skin} strokeWidth="1.1" />

      {/* 形状特定尾巴 */}
      {shape === "cat" && (
        <path d={`M ${50 + bodyW / 2} 80 Q ${62 + bodyW / 2} 76 ${64 + bodyW / 2} 64`} fill="none" stroke={skin} strokeWidth="3.5" strokeLinecap="round" />
      )}
      {shape === "bunny" && (
        <circle cx={50 - bodyW / 2 - 2} cy="86" r="6" fill="#fff" stroke={skin} strokeWidth="1.2" />
      )}

      {/* 托特包叠加：身侧一个小包 */}
      {tote && (
        <g>
          <rect x={50 + bodyW / 2 + 1} y="74" width="13" height="13" rx="2" fill="#D7C7AA" stroke="#8a5a3c" strokeWidth="1" />
          <path d={`M ${50 + bodyW / 2 + 2} 74 Q ${50 + bodyW / 2 + 7.5} 69 ${50 + bodyW / 2 + 13} 74`} fill="none" stroke="#8a5a3c" strokeWidth="1.2" />
        </g>
      )}

      {/* 心情角标 */}
      <text x="72" y="20" fontSize="11" textAnchor="middle" dominantBaseline="central">{face.emoji}</text>
    </svg>
  );
}

function mouthPath(kind: string): string {
  switch (kind) {
    case "◡": return "M 44 32 Q 50 36 56 32"; // 笑
    case "‿": return "M 45 33 Q 50 31 55 33"; // 平
    case "o": return "M 50 33 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0"; // 撑圆嘴
    case "⌓": return "M 44 34 Q 50 30 56 34"; // 下弯（饿/累）
    case "⌒": return "M 44 31 Q 50 35 56 31"; // 上弯（烦恼抿嘴）
    default: return "M 45 33 Q 50 31 55 33";
  }
}
