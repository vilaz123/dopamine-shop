"use client";

import { useEffect, useMemo, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { saveAccountSnapshot } from "@/lib/account/account-storage";
import { getSupabase } from "@/lib/supabase/client";
import { useAssetStore } from "@/stores/asset-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { useShareStore } from "@/stores/share-store";
import type { MockUser, ShippingProfile } from "@/types/user";
import type { Order } from "@/types/order";
import type { Badge } from "@/types/asset";
import type { Coupon } from "@/types/asset";

type Assets = {
  coins: number;
  xp: number;
  badges: Badge[];
  coupons: Coupon[];
  inventory: Record<string, number>;
  favorites: string[];
  history: string[];
};

type SyncDeps = { orders: Order[]; assets: Assets; cart: unknown[]; shares: unknown[] };

// ---- merge helpers ----------------------------------------------------------

function union<T>(a: T[], b: T[]): T[] {
  const seen = new Set(a);
  const out = [...a];
  for (const x of b) if (!seen.has(x)) {
    seen.add(x);
    out.push(x);
  }
  return out;
}

function unionBy<T, K>(a: T[], b: T[], key: (t: T) => K): T[] {
  const map = new Map<K, T>();
  for (const x of a) map.set(key(x), x);
  for (const x of b) if (!map.has(key(x))) map.set(key(x), x); // 本地优先
  return [...map.values()];
}

function maxKeys(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
}

// ---- cloud load (sign-in 时把云端灌进本地 stores，合并策略：取大/并集) --------

async function ensureProfile(supabaseUser: User) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { data } = await supabase.from("profiles").select("id").eq("id", supabaseUser.id).maybeSingle();
  if (data) return; // 触发器已建，幂等兜底跳过
  await supabase.from("profiles").upsert({
    id: supabaseUser.id,
    email: supabaseUser.email ?? null,
    username: (supabaseUser.user_metadata?.username as string | undefined) ?? "仓友",
    avatar_color: "#ff4d6d",
  }, { onConflict: "id" });
}

async function loadCloudState(supabaseUser: User) {
  const supabase = getSupabase();
  if (!supabase) return;
  const uid = supabaseUser.id;

  const [profileRes, stateRes, ordersRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    supabase.from("account_state").select("*").eq("user_id", uid).maybeSingle(),
    supabase.from("orders").select("*").eq("user_id", uid),
  ]);

  const profile = (profileRes.data ?? null) as Record<string, unknown> | null;
  const cloudState = (stateRes.data ?? null) as Record<string, unknown> | null;
  const cloudOrders = ((ordersRes.data ?? []) as { id: string; payload: Order }[])
    .map((row) => row.payload)
    .filter(Boolean) as Order[];

  // 合并资产：币/XP 取较大值；勋章按 id 并集；券按 code 并集；库存按 slug 取较大值；收藏/浏览并集并保留客户端 cap
  const a = useAssetStore.getState();
  useAssetStore.setState({
    coins: Math.max(a.coins, Number(profile?.coins ?? 0)),
    xp: Math.max(a.xp, Number(profile?.xp ?? 0)),
    badges: unionBy(a.badges, (profile?.badges as Badge[] | null) ?? [], (b) => b.id),
    coupons: unionBy(a.coupons, (profile?.coupons as Coupon[] | null) ?? [], (c) => c.code),
    inventory: maxKeys(a.inventory, (cloudState?.inventory as Record<string, number> | null) ?? {}),
    favorites: union(a.favorites, (cloudState?.favorites as string[] | null) ?? []).slice(0, 60),
    history: union(a.history, (cloudState?.history as string[] | null) ?? []).slice(0, 40),
  });

  // 合并订单：按 id 并集（本地优先），按时间倒序，保留 100 条上限
  const localOrders = useOrderStore.getState().orders;
  const mergedOrders = unionBy(localOrders, cloudOrders, (o) => o.id)
    .sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt))
    .slice(0, 100);
  useOrderStore.setState({ orders: mergedOrders });

  // 用云端 profile 回填 auth user（兜底：若当前无 user 则按 profile 新建）
  const current = useAuthStore.getState().user;
  const built: MockUser = current
    ? {
        ...current,
        username: (profile?.username as string | null) ?? current.username,
        avatarColor: (profile?.avatar_color as string | null) ?? current.avatarColor,
        phone: (profile?.phone as string | null) ?? current.phone,
        email: (profile?.email as string | null) ?? current.email ?? supabaseUser.email ?? undefined,
        shipping: (profile?.shipping as ShippingProfile | null) ?? current.shipping,
        onboarded: Boolean(profile?.onboarded ?? current.onboarded),
        isAnonymous: supabaseUser.is_anonymous ?? false,
      }
    : {
        id: uid,
        email: (profile?.email as string | null) ?? supabaseUser.email ?? undefined,
        phone: (profile?.phone as string | null) ?? undefined,
        username: (profile?.username as string | null) ?? `仓友${(supabaseUser.email ?? "x").slice(-4)}`,
        avatarColor: (profile?.avatar_color as string | null) ?? "#ff4d6d",
        shipping: (profile?.shipping as ShippingProfile | null) ?? undefined,
        createdAt: (profile?.created_at as string | null) ?? new Date().toISOString(),
        onboarded: Boolean(profile?.onboarded ?? false),
        isAnonymous: supabaseUser.is_anonymous ?? false,
      };
  useAuthStore.getState().setUserFromSession(built);
}

// ---- cloud write (登录态下依赖变化时 debounce 写回) --------------------------

async function writeCloudState(user: MockUser, deps: SyncDeps) {
  const supabase = getSupabase();
  if (!supabase) return;
  const uid = user.id;

  // profiles：写资产 + 展示型字段（与 updateProfile 的 upsert 互补，各写不同列）
  await supabase.from("profiles").upsert({
    id: uid,
    username: user.username,
    avatar_color: user.avatarColor,
    phone: user.phone ?? null,
    email: user.email ?? null,
    onboarded: user.onboarded,
    shipping: user.shipping ?? null,
    coins: deps.assets.coins,
    xp: deps.assets.xp,
    badges: deps.assets.badges,
    coupons: deps.assets.coupons,
  }, { onConflict: "id" });

  // account_state：库存 / 收藏 / 浏览
  await supabase.from("account_state").upsert({
    user_id: uid,
    inventory: deps.assets.inventory,
    favorites: deps.assets.favorites,
    history: deps.assets.history,
  }, { onConflict: "user_id" });

  // orders：全量 upsert（按 id 去重）
  if (deps.orders.length) {
    const rows = deps.orders.map((o) => ({
      id: o.id,
      user_id: uid,
      created_at: o.createdAt,
      payload: o as unknown,
    }));
    await supabase.from("orders").upsert(rows, { onConflict: "id" });
  }
}

// ---- component --------------------------------------------------------------

export function AccountSync() {
  const user = useAuthStore((state) => state.user);
  const setUserFromSession = useAuthStore((state) => state.setUserFromSession);
  const orders = useOrderStore((state) => state.orders);
  const cart = useCartStore((state) => state.items);
  const shares = useShareStore((state) => state.shares);
  const coins = useAssetStore((state) => state.coins);
  const xp = useAssetStore((state) => state.xp);
  const badges = useAssetStore((state) => state.badges);
  const coupons = useAssetStore((state) => state.coupons);
  const inventory = useAssetStore((state) => state.inventory);
  const favorites = useAssetStore((state) => state.favorites);
  const history = useAssetStore((state) => state.history);
  const assets = useMemo<Assets>(
    () => ({ coins, xp, badges, coupons, inventory, favorites, history }),
    [coins, xp, badges, coupons, inventory, favorites, history],
  );

  // 防止首次加载云端前用本地默认值覆盖云端（clobber guard）
  const loadedRef = useRef(false);

  // 1) 本地快照（保留原行为，离线仍可用）
  useEffect(() => {
    if (!user) return;
    saveAccountSnapshot(user, { orders, assets, cart, shares });
  }, [user, orders, assets, cart, shares]);

  // 2) 鉴权状态订阅：SIGNED_IN 加载云端 → 合并；SIGNED_OUT 清空
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !session) {
        loadedRef.current = false;
        setUserFromSession(null);
        return;
      }
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session.user) {
        await ensureProfile(session.user);
        await loadCloudState(session.user);
        loadedRef.current = true;
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [setUserFromSession]);

  // 3) 进站自动匿名登录：cloud 启用且当前无会话 → 建一个匿名 uid，
  //    之后浏览/收藏等会同步到该 uid 的 account_state；注册时升级为正式账号即继承。
  //    （不在 onAuthStateChange 回调里调 auth 操作，避免 Supabase 警告，用独立 effect。）
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        await supabase.auth.signInAnonymously();
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 4) 登录态下依赖变化 → debounce 写回云端（加载完成前不写，防 clobber）
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const deps: SyncDeps = { orders, assets, cart, shares };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!loadedRef.current) return; // 云端尚未加载完成，先不写
      void writeCloudState(user, deps);
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, orders, assets, cart, shares]);

  return null;
}
