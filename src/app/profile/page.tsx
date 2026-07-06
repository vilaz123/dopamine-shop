import { ProfileDashboard } from "@/components/profile/ProfileDashboard";

export default function ProfilePage() {
  return (
    <section className="container-shell py-16">
      <p className="text-xs uppercase tracking-[0.32em] text-[#8b6b2f]">Profile</p>
      <h1 className="font-display mt-4 text-6xl">我的账号</h1>
      <div className="mt-12"><ProfileDashboard /></div>
    </section>
  );
}
