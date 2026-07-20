import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { PageTheme } from "@/components/common/PageTheme";

export default function LoginPage() {
  return (
    <PageTheme className="min-h-screen">
      <section className="container-shell grid min-h-[60vh] items-center gap-8 py-10 sm:py-16 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Account</p>
          <h1 className="font-display mt-4 text-4xl leading-tight sm:text-5xl md:text-7xl" style={{ color: "var(--page-ink)" }}>登录 Dopahub 多巴胺仓</h1>
          <p className="mt-6 text-lg leading-8" style={{ color: "var(--page-soft)" }}>用邮箱登录后，订单、虚拟资产、收货偏好与社区记录会同步到云端，并可在多设备间共享。</p>
        </div>
        <EmailAuthForm />
      </section>
    </PageTheme>
  );
}
