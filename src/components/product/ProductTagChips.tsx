import type { ProductTag } from "@/types/product";
import { Badge } from "@/components/ui/Badge";

function toneFor(kind: ProductTag["kind"]) {
  if (kind === "rank") return "hot" as const;
  if (kind === "sold") return "gold" as const;
  if (kind === "stock") return "green" as const;
  return "blue" as const;
}

export function ProductTagChips({ tags }: { tags: ProductTag[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 3).map((tag) => (
        <Badge key={`${tag.kind}-${tag.label}`} tone={toneFor(tag.kind)} className="shadow-lg shadow-black/10">
          {tag.label}
        </Badge>
      ))}
    </div>
  );
}
