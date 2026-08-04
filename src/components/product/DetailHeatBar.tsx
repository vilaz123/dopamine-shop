"use client";

import { useInView } from "@/lib/utils/useInView";
import { useFill } from "@/lib/utils/useFill";

/**
 * 详情页用的虚拟热度条（client，因为详情页是 server component）。
 * value 归一化目标（如 sold/10000），进视口 0→目标。
 */
export function DetailHeatBar({ value, label = "虚拟热度", saturation, accent }: { value: number; label?: string; saturation: string; accent: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const fill = useFill(inView);
  const heat = Math.min(1, value);
  return (
    <div ref={ref} className="min-w-0 flex-1">
      <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--muted) 18%, transparent)" }}>
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${heat * fill * 100}%`, background: `linear-gradient(90deg, ${saturation}, ${accent})` }} />
      </div>
      <p className="mt-1 text-[11px] text-[var(--muted)]">{label}</p>
    </div>
  );
}
