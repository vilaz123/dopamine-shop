"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/lib/data/products";
import { calculateDiscount } from "@/lib/data/coupons";
import { evaluateBadges } from "@/lib/data/badges";
import { findRelevantBundles } from "@/lib/data/bundles";
import { formatCurrency } from "@/lib/utils/format";
import { makeOrderId } from "@/lib/utils/id";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { useAssetStore } from "@/stores/asset-store";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { CouponPicker } from "@/components/checkout/CouponPicker";
import { BundleHints } from "@/components/checkout/BundleHints";
import { GiftWrapToggle } from "@/components/checkout/GiftWrapToggle";
import { PageTheme } from "@/components/common/PageTheme";

export default function CheckoutPage() {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("NEWCOMER");
  const [virtualAddress, setVirtualAddress] = useState("多巴胺仓 · 幻想街区 · 永不签收门牌 8 号");
  const [giftWrap, setGiftWrap] = useState(false);
  const [note, setNote] = useState("");
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const addOrder = useOrderStore((state) => state.addOrder);
  const asset = useAssetStore();
  const user = useAuthStore((state) => state.user);
  const setLastReward = useUiStore((state) => state.setLastReward);

  useEffect(() => {
    setCouponCode(new URLSearchParams(window.location.search).get("coupon")?.toUpperCase() ?? "NEWCOMER");
  }, []);

  const lines = useMemo(() => items.map((item) => ({ item, product: products.find((p) => p.slug === item.slug) })).filter((line): line is { item: typeof items[number]; product: (typeof products)[number] } => Boolean(line.product)), [items]);
  const subtotal = lines.reduce((sum, line) => sum + (line.product.price + (line.item.optionPriceDelta ?? 0)) * line.item.quantity + (line.item.giftWrap || giftWrap ? 9 : 0), 0);
  const { coupon, discount } = calculateDiscount(subtotal, couponCode);
  const total = subtotal - discount;
  const slugs = lines.map((line) => line.product.slug);
  const bundleBonus = findRelevantBundles(slugs).reduce((sum, bundle) => bundle.memberSlugs.every((slug) => slugs.includes(slug)) ? sum + bundle.rewardCoins : sum, 0);
  const coinsEarned = lines.reduce((sum, line) => sum + line.product.rewardCoins * line.item.quantity + (line.item.giftWrap || giftWrap ? 5 : 0), 0) + bundleBonus;
  const xpEarned = Math.max(10, Math.round(total / 30));

  function submit() {
    if (lines.length === 0) return;
    lines.forEach(({ product, item }) => asset.addInventory(product.slug, item.quantity));
    asset.grantCoins(coinsEarned);
    asset.grantXp(xpEarned);
    const nextAsset = { ...asset, coins: asset.coins + coinsEarned, xp: asset.xp + xpEarned, inventory: { ...asset.inventory } };
    lines.forEach(({ product, item }) => { nextAsset.inventory[product.slug] = (nextAsset.inventory[product.slug] ?? 0) + item.quantity; });
    const badges = evaluateBadges(nextAsset, { hasFood: lines.some((line) => line.product.category === "food-delivery"), hasLuxury: lines.some((line) => line.product.category === "light-luxury") });
    asset.unlockBadges(badges);
    const order = {
      id: makeOrderId(),
      createdAt: new Date().toISOString(),
      items: lines.map(({ item, product }) => ({ ...item, giftWrap: item.giftWrap || giftWrap, name: product.name, subtitle: product.subtitle, price: product.price + (item.optionPriceDelta ?? 0), accent: product.accent, saturation: product.saturation, monogram: product.monogram, rewardCoins: product.rewardCoins, deliveryFlavor: product.deliveryFlavor ?? "parcel" as const })),
      subtotal,
      discount,
      total,
      coinsEarned,
      xpEarned,
      badges: badges.map((badge) => badge.name),
      deliveryFlavor: lines.some((line) => line.product.deliveryFlavor === "rider") ? "rider" as const : "parcel" as const,
      profile: { virtualAddress, giftWrap, deliveryCompletion: user?.shipping?.deliveryCompletion ?? "never", couponCode: coupon?.code, couponLabel: coupon?.label, note },
    };
    addOrder(order);
    clear();
    setLastReward({ id: order.id, coins: coinsEarned, xp: xpEarned, badge: badges[0]?.name });
    router.push(`/orders?order=${order.id}&success=1`);
  }

  if (!user || user.isAnonymous) return (
    <PageTheme className="min-h-screen">
    <section className="container-shell py-16">
      <div className="rounded-[2.5rem] border border-dashed border-black/15 bg-white p-12 text-center">
        <h1 className="font-display text-4xl sm:text-5xl" style={{ color: "var(--page-ink)" }}>登录后即可虚拟下单</h1>
        <p className="mt-5 text-lg leading-8" style={{ color: "var(--page-soft)" }}>虚拟下单、获得多巴胺币与勋章需要先注册账号。你匿名浏览攒下的进度会在注册后自动继承到账号里。购物车已保留，登录回来一键结算。</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/login">去注册 / 登录</ButtonLink>
          <ButtonLink href="/shop" variant="ghost">继续逛逛</ButtonLink>
        </div>
      </div>
    </section>
    </PageTheme>
  );

  if (lines.length === 0) return (
    <PageTheme className="min-h-screen">
    <section className="container-shell py-16"><div className="rounded-[2.5rem] border border-dashed border-black/15 bg-white p-12 text-center"><h1 className="font-display text-4xl sm:text-5xl" style={{ color: "var(--page-ink)" }}>没有可结算的虚拟商品。</h1><ButtonLink href="/shop" className="mt-8">返回多巴胺仓</ButtonLink></div></section>
    </PageTheme>
  );

  return (
    <PageTheme className="min-h-screen">
    <section className="container-shell py-16">
      <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>One-click virtual checkout</p>
      <h1 className="font-display mt-4 text-4xl sm:text-6xl" style={{ color: "var(--page-ink)" }}>一键虚拟下单</h1>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-7"><h2 className="font-display text-4xl">虚拟地址</h2><input value={virtualAddress} onChange={(e) => setVirtualAddress(e.target.value)} className="mt-5 w-full rounded-2xl border border-black/10 bg-white/65 px-4 py-3 text-sm outline-none" /></div>
          <CouponPicker subtotal={subtotal} value={couponCode} onChange={setCouponCode} />
          <BundleHints slugs={slugs} />
          <GiftWrapToggle checked={giftWrap} onChange={setGiftWrap} />
          <div className="rounded-[2rem] bg-white p-7"><h2 className="font-display text-4xl">备注留言</h2><Textarea className="mt-5" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：请把快乐放在门口，不要真实敲门。" /></div>
        </div>
        <aside className="h-fit rounded-[2rem] bg-[var(--ink)] p-7 text-[var(--bone)]"><h2 className="font-display text-4xl">订单确认</h2><div className="mt-6 space-y-4">{lines.map(({ item, product }) => <div key={`${item.slug}-${JSON.stringify(item.options)}`} className="flex justify-between gap-4 border-b border-white/10 pb-4 text-sm text-white/70"><span>{product.name} × {item.quantity}</span><span>{formatCurrency((product.price + (item.optionPriceDelta ?? 0)) * item.quantity)}</span></div>)}</div><div className="mt-6 space-y-3 text-sm text-white/70"><div className="flex justify-between"><span>虚拟小计</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>优惠</span><span>-{formatCurrency(discount)}</span></div><div className="flex justify-between border-t border-white/10 pt-4 text-[var(--bone)]"><span>实际扣款</span><span className="font-display text-4xl">¥0</span></div><p className="text-[var(--gold)]">下单后获得 +{coinsEarned} 币 · +{xpEarned} XP</p></div><Button type="button" variant="light" className="mt-8 w-full" onClick={submit}>一键虚拟下单</Button></aside>
      </div>
    </section>
    </PageTheme>
  );
}
