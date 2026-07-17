import Link from "next/link";
import { clsx } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "dark" | "light" | "ghost";
};

export function Button({ className, variant = "dark", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "dark" && "bg-[#241A4D] text-[#FFF5F8] hover:bg-[#3A2A6E]",
        variant === "light" && "bg-[#FFF5F8] text-[#241A4D] hover:bg-white",
        variant === "ghost" && "border border-black/15 bg-transparent text-[#241A4D] hover:border-black/40",
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({ href, children, className, variant = "dark", ...props }: { href: string; children: React.ReactNode; className?: string; variant?: "dark" | "light" | "ghost" } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      {...props}
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-300",
        variant === "dark" && "bg-[#241A4D] text-[#FFF5F8] hover:bg-[#3A2A6E]",
        variant === "light" && "bg-[#FFF5F8] text-[#241A4D] hover:bg-white",
        variant === "ghost" && "border border-black/15 bg-transparent text-[#241A4D] hover:border-black/40",
        className,
      )}
    >
      {children}
    </Link>
  );
}
