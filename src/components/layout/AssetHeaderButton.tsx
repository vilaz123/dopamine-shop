"use client";

import { Coins } from "lucide-react";
import { selectLevel, useAssetStore } from "@/stores/asset-store";
import Link from "next/link";

export function AssetHeaderButton() {
  const coins = useAssetStore((state) => state.coins);
  const xp = useAssetStore((state) => state.xp);
  const level = selectLevel(xp);
  return (
    <Link href="/assets" className="hidden items-center gap-2 rounded-full border border-black/10 bg-white/40 px-4 py-2 text-sm font-semibold transition hover:border-black/30 md:flex">
      <Coins size={16} className="text-[#b5975a]" />
      {coins} 币 · Lv.{level.level}
    </Link>
  );
}
