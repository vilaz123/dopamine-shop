"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const preferences = ["永远派送中", "放在幻想门口", "骑手不要打电话", "快递员循环派送", "仅虚拟通知"];

export function ProfileForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [username, setUsername] = useState(user?.username ?? "");
  const [addShipping, setAddShipping] = useState(Boolean(user?.shipping));
  const [receiverName, setReceiverName] = useState(user?.shipping?.receiverName ?? "理智签收人");
  const [phone, setPhone] = useState(user?.shipping?.phone ?? user?.phone ?? "");
  const [address, setAddress] = useState(user?.shipping?.address ?? "幻想街区 8 号");
  const [deliveryPreference, setDeliveryPreference] = useState(user?.shipping?.deliveryPreference ?? preferences[0]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    updateProfile({
      username,
      shipping: addShipping ? { receiverName, phone, address, deliveryPreference } : undefined,
    });
    router.push("/profile");
  }

  return (
    <form onSubmit={submit} className="rounded-[2.5rem] bg-[#fffaf2] p-8">
      <h2 className="font-display text-5xl">设置你的仓主资料</h2>
      <div className="mt-8 space-y-4">
        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" required />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addShipping} onChange={(e) => setAddShipping(e.target.checked)} /> 添加虚拟收货信息</label>
      </div>
      {addShipping && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="收货人" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="电话" />
          <Input className="md:col-span-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="地址" />
          <select value={deliveryPreference} onChange={(e) => setDeliveryPreference(e.target.value)} className="md:col-span-2 rounded-2xl border border-black/10 bg-white/65 px-4 py-3 text-sm">
            {preferences.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      )}
      <Button type="submit" className="mt-8 w-full">保存并进入账号</Button>
    </form>
  );
}
