"use client";

import { useEffect, useState } from "react";

/**
 * 自动轮播：enabled（一般传 inView）且未暂停且 length>1 时按 ms 切换 active。
 * 复刻 BlindShowcase 的 setInterval 轮播逻辑，给外卖/商店展示卡共用。
 * 触屏无 hover，paused 恒 false，照样自动轮播；桌面 hover 时 paused=true 暂停。
 */
export function useAutoCarousel(length: number, enabled: boolean, paused: boolean, ms = 2600) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!enabled || paused || length <= 1) return;
    const t = setInterval(() => setActive((a) => (a + 1) % length), ms);
    return () => clearInterval(t);
  }, [enabled, paused, length, ms]);
  return { active, setActive };
}
