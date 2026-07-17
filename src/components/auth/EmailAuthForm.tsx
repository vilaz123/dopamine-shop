"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuthStore } from "@/stores/auth-store";
import { getSupabase } from "@/lib/supabase/client";
import type { MockUser, ShippingProfile } from "@/types/user";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function translateAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "邮箱或密码错误。";
  if (m.includes("already registered") || m.includes("already been registered")) return "该邮箱已注册，请直接登录。";
  if (m.includes("password should be") || m.includes("weak")) return "密码太弱，至少 6 位。";
  if (m.includes("rate limit") || m.includes("too many")) return "操作过于频繁，请稍后再试。";
  if (m.includes("email")) return message;
  return message || "登录失败，请重试。";
}

/** 前端语法校验（不验证真实性，真实性靠 Supabase 邮箱确认链接）。 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isEmailValid(email: string) {
  return EMAIL_RE.test(email.trim());
}

function profileToUser(supabaseUser: User, profile: Record<string, unknown> | null): MockUser {
  const email = supabaseUser.email ?? undefined;
  const ship = (profile?.shipping as ShippingProfile | null) ?? undefined;
  return {
    id: supabaseUser.id,
    email,
    phone: (profile?.phone as string | null) ?? undefined,
    username:
      (profile?.username as string | null) ??
      (supabaseUser.user_metadata?.username as string | undefined) ??
      (email ? `仓友${email.split("@")[0].slice(-4) || ""}` : "仓友"),
    avatarColor: (profile?.avatar_color as string | null) ?? "#FF3D81",
    shipping: ship,
    createdAt: (profile?.created_at as string | null) ?? new Date().toISOString(),
    onboarded: Boolean(profile?.onboarded ?? false),
    isAnonymous: supabaseUser.is_anonymous ?? false,
  };
}

export function EmailAuthForm() {
  const router = useRouter();
  const mockEmailSignIn = useAuthStore((state) => state.mockEmailSignIn);
  const setUserFromSession = useAuthStore((state) => state.setUserFromSession);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const cloudOff = getSupabase() === null;

  async function afterAuth(supabaseUser: User) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .maybeSingle();
    const user = profileToUser(supabaseUser, profile);
    setUserFromSession(user);
    router.push(user.onboarded ? "/profile" : "/onboarding");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!email.trim() || !password) {
      setError("请输入邮箱和密码。");
      return;
    }
    if (!isEmailValid(email)) {
      setError("邮箱格式不正确，请检查后重试。");
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 位。");
      return;
    }

    // 未配置 Supabase：本地降级 mock 登录
    if (cloudOff) {
      const user = mockEmailSignIn(email.trim(), username.trim() || undefined);
      router.push(user.onboarded ? "/profile" : "/onboarding");
      return;
    }

    const supabase = getSupabase()!;
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const anonSession = sessionData.session?.user?.is_anonymous === true;

      if (mode === "signup") {
        if (!username.trim()) {
          setError("请输入昵称。");
          return;
        }
        if (anonSession) {
          // 升级匿名账号为正式邮箱账号：同一 uid，币/历史/订单全部继承
          const { data: updateData, error } = await supabase.auth.updateUser({
            email: email.trim(),
            password,
            data: { username: username.trim(), phone: phone.trim() || null },
          });
          if (error) throw error;
          // 触发器只在新建 auth.users 时跑，这里补写选定的昵称/邮箱到 profile
          await supabase.from("profiles").upsert({
            id: sessionData.session!.user.id,
            username: username.trim(),
            phone: phone.trim() || null,
            email: email.trim(),
            onboarded: false,
          }, { onConflict: "id" });
          const u = updateData.user ?? (await supabase.auth.getUser()).data.user;
          if (u) await afterAuth(u);
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { data: { username: username.trim(), phone: phone.trim() || null } },
          });
          if (error) throw error;
          if (data.session && data.user) {
            await afterAuth(data.user);
          } else {
            setNotice("注册成功。请到邮箱完成确认后，再使用登录。");
            setMode("signin");
          }
        }
      } else {
        // 登录已有账号：若当前是匿名会话，先退出匿名，避免与正式账号冲突
        if (anonSession) await supabase.auth.signOut();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) await afterAuth(data.user);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(translateAuthError(message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[2.5rem] bg-white p-8">
      <h2 className="font-display text-5xl">{mode === "signin" ? "邮箱登录" : "注册账号"}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        用邮箱 + 密码登录，订单、资产与社区记录会同步到云端并在多设备间共享。
        {cloudOff && <span className="text-[var(--hot)]"> （未配置云端，当前为本地账号模式。）</span>}
      </p>
      <div className="mt-8 space-y-4">
        <Input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱" />
        {email.trim() && !isEmailValid(email) && (
          <p className="-mt-2 text-sm text-red-500">邮箱格式不正确，应形如 you@example.com</p>
        )}
        <Input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码（至少 6 位）" />
        {mode === "signup" && (
          <>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="昵称" />
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号（可选）" />
          </>
        )}
      </div>
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {notice && <p className="mt-4 text-sm text-[var(--hot)]">{notice}</p>}
      <Button type="submit" className="mt-6 w-full" disabled={busy}>
        {busy ? "处理中…" : mode === "signin" ? "登录 / 进入账号" : "注册并进入"}
      </Button>
      <button
        type="button"
        className="mt-4 w-full text-sm text-[var(--muted)] underline-offset-4 hover:underline"
        onClick={() => {
          setError("");
          setNotice("");
          setMode(mode === "signin" ? "signup" : "signin");
        }}
      >
        {mode === "signin" ? "还没有账号？去注册" : "已有账号？去登录"}
      </button>
    </form>
  );
}
