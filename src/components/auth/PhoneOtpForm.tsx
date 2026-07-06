"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function PhoneOtpForm() {
  const router = useRouter();
  const sendCode = useAuthStore((state) => state.sendCode);
  const verifyCode = useAuthStore((state) => state.verifyCode);
  const pendingPhone = useAuthStore((state) => state.pendingPhone);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function submitCode(event: React.FormEvent) {
    event.preventDefault();
    const result = verifyCode(code);
    if (!result.ok) {
      setError("验证码错误。开发模式验证码是 123456。");
      return;
    }
    router.push(result.firstLogin ? "/onboarding" : "/profile");
  }

  return (
    <div className="rounded-[2.5rem] bg-[#fffaf2] p-8">
      <h2 className="font-display text-5xl">手机验证码登录</h2>
      <p className="mt-3 text-sm leading-6 text-[#7a7167]">当前为开发模式，不发送真实短信；验证码固定为 <span className="font-semibold text-black">123456</span>。后续可切换 Supabase 真实短信。</p>
      <div className="mt-8 space-y-4">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" />
        <Button type="button" className="w-full" onClick={() => phone && sendCode(phone)}>发送验证码</Button>
      </div>
      {pendingPhone && (
        <form onSubmit={submitCode} className="mt-8 space-y-4 border-t border-black/10 pt-6">
          <p className="text-sm text-[#7a7167]">验证码已发送到：{pendingPhone}</p>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="输入 123456" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">登录 / 注册</Button>
        </form>
      )}
    </div>
  );
}
