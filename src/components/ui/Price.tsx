import { formatCurrency } from "@/lib/utils/format";

export function Price({ value, className }: { value: number; className?: string }) {
  return <span className={className}>{formatCurrency(value)}</span>;
}
