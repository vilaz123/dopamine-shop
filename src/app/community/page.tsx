import { CommunityFeed } from "@/components/community/CommunityFeed";

export default function CommunityPage() {
  return (
    <section className="container-shell py-16">
      <p className="text-xs uppercase tracking-[0.32em] text-[#FF3D81]">Community</p>
      <h1 className="font-display mt-4 text-6xl">多巴胺广场</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5A4A6A]">分享今天的虚拟战利品、差点真实下单的瞬间、永远在路上的骑手，以及你省下的钱。</p>
      <div className="mt-12"><CommunityFeed /></div>
    </section>
  );
}
