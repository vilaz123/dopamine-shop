import type { DeliveryFlavor } from "@/types/product";
import { getTrackingProgress } from "@/lib/tracking/stages";
import { formatDateTime } from "@/lib/utils/format";

export function TrackingTimeline({ createdAt, flavor }: { createdAt: string; flavor: DeliveryFlavor }) {
  const tracking = getTrackingProgress(createdAt, flavor);
  return (
    <div className="mt-6 space-y-5">
      {tracking.map((stage, index) => (
        <div key={stage.key} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`mt-1 grid h-5 w-5 place-items-center rounded-full border text-[10px] ${stage.reached ? "border-black bg-black text-white" : "border-black/20 text-transparent"}`}>{index + 1}</div>
            {index < tracking.length - 1 && <div className={`mt-2 h-full min-h-10 w-px ${stage.reached ? "bg-black/40" : "bg-black/10"}`} />}
          </div>
          <div className="flex-1 border-b border-black/10 pb-5">
            <div className="flex items-center justify-between gap-4">
              <p className={stage.reached ? "font-semibold" : "text-[#7a7167]"}>{stage.label}{stage.terminal ? " · 终态" : ""}</p>
              {stage.terminal && <span className="rounded-full bg-[#ef4444] px-3 py-1 text-xs text-white">永不签收</span>}
            </div>
            <p className="mt-1 text-sm text-[#7a7167]">{stage.note}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#9d9286]">{formatDateTime(stage.at)}</p>
          </div>
        </div>
      ))}
      <div className="relative overflow-hidden rounded-3xl bg-[#0b0b0b] p-5 text-[#f6f1e8]">
        <div className="absolute left-4 right-4 top-1/2 h-px bg-white/20" />
        <div className="relative h-16">
          <div className="absolute top-5 h-5 w-5 rounded-full bg-[#ffd23f] shadow-lg shadow-yellow-300/40 [animation:reward-flash_2.6s_linear_infinite]" />
        </div>
        <p className="text-sm text-white/70">{flavor === "rider" ? "骑手正在地图上循环接近你" : "快递员正在幻想路线中循环派送"}</p>
      </div>
    </div>
  );
}
