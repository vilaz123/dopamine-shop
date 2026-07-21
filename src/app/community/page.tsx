import { CommunityFeed } from "@/components/community/CommunityFeed";
import { Leaderboard } from "@/components/community/Leaderboard";
import { PageTheme } from "@/components/common/PageTheme";

export default function CommunityPage() {
  return (
    <PageTheme className="min-h-screen">
      <section className="container-shell py-10 sm:py-16">
        <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--page-ink)" }}>Community</p>
        <h1 className="font-display mt-3 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>多巴胺广场</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8" style={{ color: "var(--page-soft)" }}>分享今天的虚拟战利品、差点真实下单的瞬间、永远在路上的骑手，以及你省下的钱。</p>
        <div className="mt-10 sm:mt-12"><Leaderboard /></div>
        <div className="mt-10 sm:mt-12"><CommunityFeed /></div>
      </section>
    </PageTheme>
  );
}
