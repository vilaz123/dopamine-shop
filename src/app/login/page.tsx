import { PhoneOtpForm } from "@/components/auth/PhoneOtpForm";

export default function LoginPage() {
  return (
    <section className="container-shell grid min-h-[70vh] items-center py-16 lg:grid-cols-[.9fr_1.1fr] gap-10">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">Account</p>
        <h1 className="font-display mt-4 text-6xl leading-none md:text-8xl">登录 Dopahub 多巴胺仓</h1>
        <p className="mt-6 text-lg leading-8 text-[#7a7167]">登录后，订单、虚拟资产、收货偏好和分享记录会保存到你的本地账号空间。当前为开发验证码版。</p>
      </div>
      <PhoneOtpForm />
    </section>
  );
}
