import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { PageTheme } from "@/components/common/PageTheme";

export default function ProfilePage() {
  return (
    <PageTheme className="min-h-screen">
      <section className="container-shell py-16">
        <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Profile</p>
        <h1 className="font-display mt-4 text-4xl sm:text-6xl" style={{ color: "var(--page-ink)" }}>我的账号</h1>
        <div className="mt-12"><ProfileDashboard /></div>
      </section>
    </PageTheme>
  );
}
