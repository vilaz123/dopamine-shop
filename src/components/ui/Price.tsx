import { formatCurrency } from "@/lib/utils/format";

export function Price({ value, className, virtual = true }: { value: number; className?: string; virtual?: boolean }) {
  return (
    <span className={className} title={virtual ? "虚拟金额，无需真实支付" : undefined}>
      {formatCurrency(value)}
      {virtual && <span className="ml-1 align-top text-xs font-sans opacity-60">虚拟</span>}
    </span>
  );
}
