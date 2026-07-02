import { clsx } from "clsx";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={clsx("rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#7a7167]", className)}>{children}</span>;
}
