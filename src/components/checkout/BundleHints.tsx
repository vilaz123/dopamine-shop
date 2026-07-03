import { findRelevantBundles } from "@/lib/data/bundles";
import { products } from "@/lib/data/products";

export function BundleHints({ slugs }: { slugs: string[] }) {
  const bundles = findRelevantBundles(slugs);
  if (bundles.length === 0) return null;
  return (
    <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white/45 p-4">
      <p className="text-sm font-semibold">虚拟凑单提示</p>
      <div className="mt-3 space-y-2 text-sm text-[#7a7167]">
        {bundles.slice(0, 2).map((bundle) => {
          const missing = bundle.memberSlugs.filter((slug) => !slugs.includes(slug)).map((slug) => products.find((product) => product.slug === slug)?.name).filter(Boolean);
          return <p key={bundle.id}>{bundle.label}：{missing.length ? `再加 ${missing.join("、")} 可多得 ${bundle.rewardCoins} 币` : `已凑齐，结算多得 ${bundle.rewardCoins} 币`}</p>;
        })}
      </div>
    </div>
  );
}
