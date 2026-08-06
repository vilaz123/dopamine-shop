"use client";

import { useState } from "react";
import type { AvatarMood, AvatarShape } from "@/types/avatar";
import { avatarLook, colorToFilter } from "@/lib/avatar/avatar-look";

/**
 * 可爱写实分身形象卡：优先加载通义万相生成的静态图（形状×身体×精神），
 * 加载失败/未生成时回退到 SVG 简笔，保证不崩。
 * 体态由 weight/satiety/calories 驱动身体图（胖瘦/吃撑/变猪），spirit 驱动精神面貌。
 */
export function AvatarBody({
  weight = 1,
  mood = "content",
  color = "#FF3D81",
  shape = "human",
  satiety = 70,
  calories = 0,
  spirit = 80,
  dopamine = 50,
  endorphin = 50,
  size = 220,
  // wardrobe 现写实形象上不硬叠，仅占位以兼容旧调用；穿戴以角标 chip 在页面上标注。
  wardrobe: _wardrobe = [],
}: {
  weight?: number;
  mood?: AvatarMood;
  color?: string;
  shape?: AvatarShape;
  satiety?: number;
  calories?: number;
  spirit?: number;
  dopamine?: number;
  endorphin?: number;
  size?: number;
  wardrobe?: string[];
}) {
  const [failed, setFailed] = useState(false);
  const look = avatarLook(shape, weight, satiety, calories, spirit, dopamine, endorphin, mood);
  const colorFilter = colorToFilter(color);
  // 显示用缩略图(快 4 倍)，src 形如 .../avatars/x.webp → .../avatars/x-thumb.webp
  const displaySrc = look.src.replace(/\.webp$/, "-thumb.webp");

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displaySrc}
        alt={look.alt}
        width={size}
        height={Math.round((size * 1216) / 832)}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="rounded-[1.25rem] object-cover shadow-lg"
        style={{ width: size, height: "auto", maxWidth: "100%", filter: colorFilter || undefined }}
        onError={() => setFailed(true)}
      />
    );
  }

  // 回退：旧 SVG 简笔（图缺失时）
  return <AvatarBodySvg weight={weight} mood={mood} color={color} shape={shape} size={size} />;
}

/** 旧 SVG 简笔回退（图缺失时用，逻辑同上一版）。 */
function AvatarBodySvg({ weight = 1, mood = "content", color = "#FF3D81", shape = "human", size = 220 }: { weight?: number; mood?: AvatarMood; color?: string; shape?: AvatarShape; size?: number }) {
  const bodyW = 36 * weight;
  const bodyH = 46;
  const skinShade = `color-mix(in srgb, ${color} 82%, white)`;
  return (
    <svg viewBox="0 0 100 124" width={size} height={(size * 124) / 100} role="img" aria-label={`分身 ${shape}`}>
      {shape === "cat" && (<><polygon points="36,18 30,2 46,14" fill={skinShade} stroke={color} strokeWidth="1.2" /><polygon points="64,18 70,2 54,14" fill={skinShade} stroke={color} strokeWidth="1.2" /></>)}
      {shape === "bunny" && (<><ellipse cx="40" cy="10" rx="5" ry="11" fill={skinShade} stroke={color} strokeWidth="1.2" /><ellipse cx="60" cy="10" rx="5" ry="11" fill={skinShade} stroke={color} strokeWidth="1.2" /></>)}
      <ellipse cx="50" cy="26" rx="17" ry="16" fill={skinShade} stroke={color} strokeWidth="1.4" />
      <circle cx="43" cy="24" r="2.6" fill="#241A4D" />
      <circle cx="57" cy="24" r="2.6" fill="#241A4D" />
      <ellipse cx="50" cy="76" rx={bodyW / 2} ry={bodyH / 2} fill={skinShade} stroke={color} strokeWidth="1.4" />
      <line x1="42" y1="98" x2="42" y2="114" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="58" y1="98" x2="58" y2="114" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <circle cx={50 - bodyW / 2 - 3} cy="74" r="4" fill={skinShade} stroke={color} strokeWidth="1.1" />
      <circle cx={50 + bodyW / 2 + 3} cy="74" r="4" fill={skinShade} stroke={color} strokeWidth="1.1" />
      {shape === "cat" && (<path d={`M ${50 + bodyW / 2} 80 Q ${62 + bodyW / 2} 76 ${64 + bodyW / 2} 64`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />)}
    </svg>
  );
}
