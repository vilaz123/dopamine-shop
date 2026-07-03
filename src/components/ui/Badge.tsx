import { clsx } from "clsx";

type Tone = "muted" | "hot" | "gold" | "green" | "blue";

export function Badge({ children, className, tone = "muted" }: { children: React.ReactNode; className?: string; tone?: Tone }) {
  return (
    <span
      className={clsx(
        "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]",
        tone === "muted" && "border-black/10 text-[#7a7167]",
        tone === "hot" && "border-red-500/30 bg-red-500 text-white",
        tone === "gold" && "border-yellow-400/40 bg-yellow-400 text-black",
        tone === "green" && "border-emerald-400/40 bg-emerald-400 text-black",
        tone === "blue" && "border-cyan-400/40 bg-cyan-400 text-black",
        className,
      )}
    >
      {children}
    </span>
  );
}
