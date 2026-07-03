"use client";

import { Heart } from "lucide-react";
import { useAssetStore } from "@/stores/asset-store";

export function FavoriteButton({ slug }: { slug: string }) {
  const favorites = useAssetStore((state) => state.favorites);
  const toggleFavorite = useAssetStore((state) => state.toggleFavorite);
  const active = favorites.includes(slug);
  return (
    <button
      onClick={(event) => {
        event.preventDefault();
        toggleFavorite(slug);
      }}
      className="rounded-full bg-white/85 p-3 text-black shadow-lg transition hover:scale-105"
      aria-label={active ? "取消收藏" : "收藏"}
    >
      <Heart size={18} fill={active ? "#ff4d6d" : "none"} color={active ? "#ff4d6d" : "currentColor"} />
    </button>
  );
}
