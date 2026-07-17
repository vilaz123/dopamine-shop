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
  const [deliveryCompletion, setDeliveryCompletion] = useState<"never" | "signed">(user?.shipping?.deliveryCompletion ?? "never");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    updateProfile({
      username,
      shipping: addShipping ? { receiverName, phone, address, deliveryPreference, deliveryCompletion } : undefined,
    });
    router.push("/profile");
  }

  return (
    <form onSubmit={submit} className="rounded-[2.5rem] bg-[#FFFFFF] p-8">
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
          <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
            <button type="button" onClick={() => setDeliveryCompletion("never")} className={`rounded-2xl border p-4 text-left text-sm ${deliveryCompletion === "never" ? "border-black bg-black text-[#FFF5F8]" : "border-black/10"}`}>永不签收<br/><span className="opacity-70">维持派送中/骑手配送中</span></button>
            <button type="button" onClick={() => setDeliveryCompletion("signed")} className={`rounded-2xl border p-4 text-left text-sm ${deliveryCompletion === "signed" ? "border-black bg-black text-[#FFF5F8]" : "border-black/10"}`}>允许送达签收<br/><span className="opacity-70">增加已送达和一键签收</span></button>
          </div>
        </div>
      )}
      <Button type="submit" className="mt-8 w-full">保存并进入账号</Button>
    </form>
  );
}
