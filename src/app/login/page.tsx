import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

export default function LoginPage() {
  return (
    <section className="container-shell grid min-h-[70vh] items-center py-16 lg:grid-cols-[.9fr_1.1fr] gap-10">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">Account</p>
        <h1 className="font-display mt-4 text-6xl leading-none md:text-8xl">登录 Dopahub 多巴胺仓</h1>
        <p className="mt-6 text-lg leading-8 text-[#7a7167]">用邮箱登录后，订单、虚拟资产、收货偏好与社区记录会同步到云端，并可在多设备间共享。</p>
      </div>
      <EmailAuthForm />
    </section>
  );
}
