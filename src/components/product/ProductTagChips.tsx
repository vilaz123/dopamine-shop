import type { ProductTag } from "@/types/product";
import { Badge } from "@/components/ui/Badge";

function toneFor(kind: ProductTag["kind"]) {
  if (kind === "rank") return "hot" as const;
  if (kind === "sold") return "gold" as const;
  if (kind === "stock") return "green" as const;
  return "blue" as const;
}

/** 优先级：rank/deal > sold > stock。图片上只挂一个角标，避免遮住画面。 */
function pickPrimary(tags: ProductTag[]): ProductTag | undefined {
  return tags.find((t) => t.kind === "rank") ?? tags.find((t) => t.kind === "deal") ?? tags.find((t) => t.kind === "stock") ?? tags[0];
}

/** 图片上的单角标（精简，不挡画面）。 */
export function ProductTagChips({ tags }: { tags: ProductTag[] }) {
  const primary = pickPrimary(tags);
  if (!primary) return null;
  return (
    <Badge tone={toneFor(primary.kind)} className="max-w-full truncate shadow-md shadow-black/10">
      {primary.label}
    </Badge>
  );
}

/** 详情页等宽位：保留全部 tag，平铺成一行，不叠在图上。 */
export function ProductTagRow({ tags }: { tags: ProductTag[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={`${tag.kind}-${tag.label}`} tone={toneFor(tag.kind)}>
          {tag.label}
        </Badge>
      ))}
    </div>
  );
}
