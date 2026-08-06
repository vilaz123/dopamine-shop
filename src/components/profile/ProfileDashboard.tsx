"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { selectLevel, useAssetStore } from "@/stores/asset-store";
import { useAuthStore } from "@/stores/auth-store";
import { useOrderStore } from "@/stores/order-store";
import { useAvatarStore } from "@/stores/avatar-store";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProfileForm } from "./ProfileForm";
import { ShareButton } from "@/components/share/ShareButton";
import { AvatarBody } from "@/components/avatar/AvatarBody";

export function ProfileDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const coins = useAssetStore((state) => state.coins);
  const xp = useAssetStore((state) => state.xp);
  const orders = useOrderStore((state) => state.orders);
  const avatar = useAvatarStore((state) => state);
  const level = selectLevel(xp);

  if (!user || user.isAnonymous) {
    return (
      <div className="rounded-[1.5rem] border border-white/60 bg-white/85 p-6 text-center shadow-sm sm:rounded-[2.5rem] sm:p-10">
        <h2 className="font-display text-3xl sm:text-5xl" style={{ color: "var(--page-ink)" }}>还没有登录</h2>
        <p className="mt-4" style={{ color: "var(--page-soft)" }}>注册账号后可查看资料、勋章与收货偏好，匿名浏览的进度会继承进来。</p>
        <ButtonLink href="/login" className="mt-8">去注册 / 登录</ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:gap-10 lg:grid-cols-[.9fr_1.1fr]">
      <aside className="dopamine-panel rounded-[1rem] p-4 shadow-md sm:rounded-[1.5rem] sm:p-6">
        <p className="text-xs text-white/70">当前账号</p>
        <h2 className="font-display mt-1.5 text-lg sm:text-xl">{user.username}</h2>
        <p className="mt-2 text-sm text-white/80">账号：{user.email ?? user.phone ?? "—"}</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-1">
          <div className="rounded-2xl bg-white/15 p-3 sm:p-3.5"><p className="text-xs text-white/70">多巴胺币</p><p className="font-display mt-0.5 text-xl sm:text-2xl">{coins}</p></div>
          <div className="rounded-2xl bg-white/15 p-3 sm:p-3.5"><p className="text-xs text-white/70">等级</p><p className="font-display mt-0.5 text-xl sm:text-2xl">Lv.{level.level}</p></div>
          <div className="rounded-2xl bg-white/15 p-3 sm:p-3.5"><p className="text-xs text-white/70">订单</p><p className="font-display mt-0.5 text-xl sm:text-2xl">{orders.length}</p></div>
        </div>
        {/* 分身入口：小 SVG + 当前心情，跳 /avatar */}
        <Link href="/avatar" className="mt-5 flex items-center gap-3 rounded-2xl bg-white/15 p-3 transition hover:bg-white/20 sm:mt-6 sm:p-4">
          <div className="shrink-0">
            <AvatarBody weight={avatar.created ? avatar.weight : 1} mood={avatar.created ? avatar.mood : "content"} color={avatar.created ? avatar.color : (user.avatarColor ?? "#FF3D81")} shape={avatar.created ? avatar.shape : "human"} satiety={avatar.created ? avatar.satiety : 70} calories={avatar.created ? avatar.calories : 0} spirit={avatar.created ? avatar.spirit : 80} dopamine={avatar.created ? avatar.dopamine : 50} endorphin={avatar.created ? avatar.endorphin : 50} wardrobe={avatar.created ? avatar.wardrobe : []} size={64} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white/70 sm:text-sm">AI 分身</p>
            <p className="font-display truncate text-base sm:text-lg">{avatar.created ? avatar.name : "未创建"}</p>
            <p className="mt-0.5 text-xs text-white/70">{avatar.created ? `卡路里 ${avatar.calories} · 体型 ${avatar.weight > 1.1 ? "圆润" : avatar.weight < 0.95 ? "清瘦" : "标准"}` : "点这里建一个 →"}</p>
          </div>
        </Link>
        {user.shipping && <div className="mt-5 rounded-2xl bg-white/15 p-3.5 text-xs leading-6 text-white/80 sm:mt-6 sm:p-4 sm:text-sm sm:leading-7"><p>收货人：{user.shipping.receiverName}</p><p>电话：{user.shipping.phone}</p><p>地址：{user.shipping.address}</p><p>偏好：{user.shipping.deliveryPreference}</p><p>签收模式：{user.shipping.deliveryCompletion === "signed" ? "可送达并一键签收" : "永不签收"}</p></div>}
        <ShareButton className="mt-5 w-full" type="profile" title={`${user.username} 邀你进入 Dopahub 多巴胺仓`} text={`我已经在多巴胺仓虚拟下单 ${orders.length} 次，实际支付 ¥0。`} />
        <Button variant="ghost" className="mt-3 w-full border-white/30 text-white" onClick={() => { logout(); router.push("/"); }}>退出登录</Button>
      </aside>
      <ProfileForm />
    </div>
  );
}
