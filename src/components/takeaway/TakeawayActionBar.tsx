"use client";

import { useRouter } from "next/navigation";
import type { TakeawayShop } from "@/lib/data/takeaway-shops";
import { getProduct } from "@/lib/data/products";
import { optionValueLabel, optionValueDelta } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";

/**
 * 店铺详情页手机底部固定操作栏（md:hidden，桌面不渲染）。
 * 以旗舰餐为默认规格「一键下单」直奔 /checkout，复用列表卡 quickOrder 路径，
 * 保留飞金币/奖励情绪反馈。无旗舰餐时不渲染。
 */
export function TakeawayActionBar({ shop }: { shop: TakeawayShop }) {
  const router = useRouter();
  const flagship = getProduct(shop.productSlugs[0]);
  const addItem = useCartStore((state) => state.addItem);
  const setLastReward = useUiStore((state) => state.setLastReward);
  const addRecentlyViewed = useUiStore((state) => state.addRecentlyViewed);
  const grantCoins = useAssetStore((state) => state.grantCoins);
  const pushHistory = useAssetStore((state) => state.pushHistory);

  if (!flagship) return null;

  function buyNow() {
    if (!flagship) return;
    const selected = Object.fromEntries(flagship.options.map((o) => [o.label, optionValueLabel(o.values[0])]));
    const delta = flagship.options.reduce((sum, o) => sum + optionValueDelta(o.values[0]), 0);
    addRecentlyViewed(flagship.slug);
    pushHistory(flagship.slug);
    addItem({ slug: flagship.slug, quantity: 1, options: selected, optionPriceDelta: delta, addedAt: new Date().toISOString() });
    grantCoins(flagship.rewardCoins);
    setLastReward({ id: `${flagship.slug}-${Date.now()}`, coins: flagship.rewardCoins });
    router.push("/checkout");
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div
        className="container-shell pb-[max(0.75rem,env(safe-area-inset-bottom)] pt-3"
        style={{ background: "color-mix(in srgb, var(--page-bg) 92%, transparent)", borderTop: "1px solid color-mix(in srgb, var(--page-accent) 60%, transparent)", backdropFilter: "blur(10px)" }}
      >
        <button
          onClick={buyNow}
          className="w-full rounded-full px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${shop.saturation}, ${shop.accent})` }}
        >
          一键下单 · {flagship.name}
        </button>
      </div>
    </div>
  );
}
