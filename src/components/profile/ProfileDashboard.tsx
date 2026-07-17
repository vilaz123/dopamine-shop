"use client";

import { useRouter } from "next/navigation";
import { selectLevel, useAssetStore } from "@/stores/asset-store";
import { useAuthStore } from "@/stores/auth-store";
import { useOrderStore } from "@/stores/order-store";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProfileForm } from "./ProfileForm";
import { ShareButton } from "@/components/share/ShareButton";

export function ProfileDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const coins = useAssetStore((state) => state.coins);
  const xp = useAssetStore((state) => state.xp);
  const orders = useOrderStore((state) => state.orders);
  const level = selectLevel(xp);

  if (!user || user.isAnonymous) {
    return (
      <div className="rounded-[2.5rem] bg-[#FFFFFF] p-10 text-center">
        <h2 className="font-display text-5xl">还没有登录</h2>
        <p className="mt-4 text-[#5A4A6A]">注册账号后可查看资料、勋章与收货偏好，匿名浏览的进度会继承进来。</p>
        <ButtonLink href="/login" className="mt-8">去注册 / 登录</ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
      <aside className="rounded-[2.5rem] bg-[#241A4D] p-8 text-[#FFF5F8]">
        <p className="text-sm text-white/60">当前账号</p>
        <h2 className="font-display mt-3 text-6xl">{user.username}</h2>
        <p className="mt-4 text-white/70">账号：{user.email ?? user.phone ?? "—"}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-3xl bg-white/10 p-5"><p className="text-sm text-white/60">多巴胺币</p><p className="font-display text-4xl">{coins}</p></div>
          <div className="rounded-3xl bg-white/10 p-5"><p className="text-sm text-white/60">等级</p><p className="font-display text-4xl">Lv.{level.level}</p></div>
          <div className="rounded-3xl bg-white/10 p-5"><p className="text-sm text-white/60">订单</p><p className="font-display text-4xl">{orders.length}</p></div>
        </div>
        {user.shipping && <div className="mt-8 rounded-3xl bg-white/10 p-5 text-sm leading-7 text-white/70"><p>收货人：{user.shipping.receiverName}</p><p>电话：{user.shipping.phone}</p><p>地址：{user.shipping.address}</p><p>偏好：{user.shipping.deliveryPreference}</p><p>签收模式：{user.shipping.deliveryCompletion === "signed" ? "可送达并一键签收" : "永不签收"}</p></div>}
        <ShareButton className="mt-6 w-full" type="profile" title={`${user.username} 邀你进入 Dopahub 多巴胺仓`} text={`我已经在多巴胺仓虚拟下单 ${orders.length} 次，实际支付 ¥0。`} />
        <Button variant="ghost" className="mt-3 w-full border-white/20 text-[#FFF5F8]" onClick={() => { logout(); router.push("/"); }}>退出登录</Button>
      </aside>
      <ProfileForm />
    </div>
  );
}
