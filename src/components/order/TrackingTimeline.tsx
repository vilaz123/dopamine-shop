import type { DeliveryFlavor } from "@/types/product";
import { getTrackingProgress } from "@/lib/tracking/stages";
import { formatDateTime } from "@/lib/utils/format";
import { RiderMapMock } from "./RiderMapMock";

export function TrackingTimeline({ createdAt, flavor, completion = "never", signedAt }: { createdAt: string; flavor: DeliveryFlavor; completion?: "never" | "signed"; signedAt?: string }) {
  const tracking = getTrackingProgress(createdAt, flavor, new Date(), completion, signedAt);
  return (
    <div className="mt-6 space-y-5">
      {tracking.map((stage, index) => (
        <div key={stage.key} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`mt-1 grid h-5 w-5 place-items-center rounded-full border text-[10px] ${stage.reached ? "border-transparent text-white" : "border-black/20 text-transparent"}`} style={stage.reached ? { background: "var(--page-ink)" } : undefined}>{index + 1}</div>
            {index < tracking.length - 1 && <div className={`mt-2 h-full min-h-10 w-px ${stage.reached ? "bg-black/40" : "bg-black/10"}`} />}
          </div>
          <div className="flex-1 border-b border-black/10 pb-5">
            <div className="flex items-center justify-between gap-4">
              <p className={stage.reached ? "font-semibold" : "opacity-70"} style={{ color: "var(--page-ink)" }}>{stage.label}{stage.terminal ? " · 终态" : ""}</p>
              {stage.terminal && <span className="rounded-full bg-[var(--danger)] px-3 py-1 text-xs text-white">{completion === "signed" ? (signedAt ? "已签收" : "待签收") : "永不签收"}</span>}
            </div>
            <p className="mt-1 text-sm" style={{ color: "var(--page-soft)" }}>{stage.note}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--page-soft)" }}>{formatDateTime(stage.at)}</p>
          </div>
        </div>
      ))}
      {flavor === "rider" ? (
        <RiderMapMock caption={completion === "signed" ? "配送路线可以抵达终点，等待你确认签收" : "骑手正在幻想路线中循环接近你，永远差一栋楼"} />
      ) : (
        <div className="relative overflow-hidden rounded-3xl p-5 text-white" style={{ background: "var(--page-ink)" }}>
          <div className="absolute left-4 right-4 top-1/2 h-px bg-white/20" />
          <div className="relative h-16">
            <div className="absolute top-5 h-5 w-5 rounded-full bg-[var(--gold)] shadow-lg shadow-yellow-300/40 [animation:reward-flash_2.6s_linear_infinite]" />
          </div>
          <p className="text-sm text-white/80">{completion === "signed" ? "配送路线可以抵达终点，等待你确认签收" : "快递员正在幻想路线中循环派送"}</p>
        </div>
      )}
    </div>
  );
}
