import { Bike, Store } from "lucide-react";

export function RiderMapMock({ etaMinutes, caption }: { etaMinutes?: number; caption?: string }) {
  const text = caption ?? (etaMinutes ? `预计 ${etaMinutes} 分钟后进入骑手配送中` : "骑手正在幻想路线中循环接近你");
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#241A4D] p-5 text-[#FFF5F8]">
      <div className="absolute left-6 right-6 top-1/2 h-px -translate-y-1/2 [background:repeating-linear-gradient(90deg,rgba(255,255,255,.5)_0,rgba(255,255,255,.5)_6px,transparent_6px,transparent_12px)]" />
      <div className="relative flex h-20 items-center justify-between gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white/80"><Store size={18} /></span>
        <div className="relative h-full flex-1">
          <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#ffd23f] shadow-lg shadow-yellow-300/40 [animation:rider-run_3.4s_linear_infinite]" />
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ffd23f] text-black"><Bike size={18} /></span>
      </div>
      <p className="mt-2 text-sm text-white/70">{text}</p>
    </div>
  );
}
