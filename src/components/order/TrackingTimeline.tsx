import type { DeliveryFlavor } from "@/types/product";
import { getTrackingProgress } from "@/lib/tracking/stages";
import { formatDateTime } from "@/lib/utils/format";

export function TrackingTimeline({ createdAt, flavor }: { createdAt: string; flavor: DeliveryFlavor }) {
  const tracking = getTrackingProgress(createdAt, flavor);
  return (
    <div className="mt-6 space-y-5">
      {tracking.map((stage) => (
        <div key={stage.key} className="flex gap-4">
          <div className={`mt-1 h-4 w-4 rounded-full border ${stage.reached ? "border-black bg-black" : "border-black/20"}`} />
          <div className="border-b border-black/10 pb-5">
            <p className={stage.reached ? "font-semibold" : "text-[#7a7167]"}>{stage.label}{stage.terminal ? " · 终态" : ""}</p>
            <p className="mt-1 text-sm text-[#7a7167]">{stage.note}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#9d9286]">{formatDateTime(stage.at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
