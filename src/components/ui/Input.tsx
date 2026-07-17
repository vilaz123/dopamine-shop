import { clsx } from "clsx";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx("w-full rounded-2xl border border-black/10 bg-white/65 px-4 py-3 text-sm outline-none transition focus:border-[var(--gilt)]", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx("w-full rounded-2xl border border-black/10 bg-white/65 px-4 py-3 text-sm outline-none transition focus:border-[var(--gilt)]", props.className)} />;
}
