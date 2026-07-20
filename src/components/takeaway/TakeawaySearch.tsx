"use client";

import { Search } from "lucide-react";

export function TakeawaySearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/70" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索奶茶、炸鸡、火锅、烧烤"
        className="w-full rounded-full border border-white/25 bg-white/12 py-4 pl-14 pr-5 text-base text-white outline-none backdrop-blur transition placeholder:text-white/55 focus:border-[var(--gold)] focus:bg-white/18"
      />
    </div>
  );
}
