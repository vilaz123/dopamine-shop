import { ProfileForm } from "@/components/profile/ProfileForm";

export default function OnboardingPage() {
  return (
    <section className="container-shell grid min-h-[70vh] items-center gap-10 py-16 lg:grid-cols-[.9fr_1.1fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[#FF3D81]">Onboarding</p>
        <h1 className="font-display mt-4 text-6xl leading-none md:text-8xl">成为多巴胺仓主</h1>
        <p className="mt-6 text-lg leading-8 text-[#5A4A6A]">设置用户名，并选择是否添加虚拟收货信息。所有信息当前保存在本地账号空间，后续可迁移到云端。</p>
      </div>
      <ProfileForm />
    </section>
  );
}
