"use client";

import { useEffect, useMemo, useState } from "react";
import { useAvatarStore } from "@/stores/avatar-store";
import { useAuthStore } from "@/stores/auth-store";
import { useOrderStore } from "@/stores/order-store";
import { useUiStore } from "@/stores/ui-store";
import { useAssetStore } from "@/stores/asset-store";
import { getProduct, products } from "@/lib/data/products";
import { isFeedable, isWearable, virtualCalories } from "@/lib/data/avatar-calories";
import { pickLine } from "@/lib/avatar/avatar-mood";
import { statInfo, type StatKey } from "@/lib/avatar/stat-info";
import { playPop } from "@/lib/utils/sfx";
import { AvatarBody } from "@/components/avatar/AvatarBody";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { AvatarShape } from "@/types/avatar";

const COLORS = ["#FF3D81", "#6C5CE7", "#FF8A00", "#06B6D4", "#22C55E", "#F43F5E"];
const SHAPES: { id: AvatarShape; label: string; emoji: string }[] = [
  { id: "human", label: "人形", emoji: "🧍" },
  { id: "cat", label: "猫", emoji: "🐱" },
  { id: "bunny", label: "兔", emoji: "🐰" },
];

export default function AvatarPage() {
  const user = useAuthStore((s) => s.user);
  const avatar = useAvatarStore((s) => s);
  const orders = useOrderStore((s) => s.orders);
  const createAvatar = useAvatarStore((s) => s.createAvatar);
  const updateAvatar = useAvatarStore((s) => s.updateAvatar);
  const feed = useAvatarStore((s) => s.feed);
  const wear = useAvatarStore((s) => s.wear);
  const resetShape = useAvatarStore((s) => s.resetShape);
  const recompute = useAvatarStore((s) => s.recompute);
  const setLastReward = useUiStore((s) => s.setLastReward);
  const triggerFly = useUiStore((s) => s.triggerFly);
  const grantCoins = useAssetStore((s) => s.grantCoins);

  const [name, setName] = useState(user?.username ? `${user.username}的分身` : "小多");
  const [color, setColor] = useState(user?.avatarColor ?? "#FF3D81");
  const [shape, setShape] = useState<AvatarShape>("human");
  const [line, setLine] = useState("建个分身，开始投喂吧");
  const [lineKey, setLineKey] = useState(0);
  // 编辑面板（已建分身改形象/名字/颜色用）
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#FF3D81");
  const [editShape, setEditShape] = useState<AvatarShape>("human");
  const [statModal, setStatModal] = useState<StatKey | null>(null);

  // 进页/聚焦时重算饥饿（随时间衰减）
  useEffect(() => {
    recompute();
    const onFocus = () => recompute();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [recompute]);

  // 心情变化时换台词
  useEffect(() => {
    if (!avatar.created) return;
    setLine(pickLine(avatar.mood));
    setLineKey((k) => k + 1);
  }, [avatar.mood, avatar.created]);

  // 从订单反查可喂/可穿物品池（按 slug 去重，不另建库存）
  const pool = useMemo(() => {
    const slugs = new Set<string>();
    for (const o of orders) for (const it of o.items) slugs.add(it.slug);
    return [...slugs].map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [orders]);
  const feedables = pool.filter(isFeedable);
  const wearables = pool.filter(isWearable);

  function openEdit() {
    setEditName(avatar.name);
    setEditColor(avatar.color);
    setEditShape(avatar.shape);
    setEditing(true);
  }

  function saveEdit() {
    updateAvatar({ name: editName, color: editColor, shape: editShape });
    setEditing(false);
  }

  function doFeed(slug: string, btn: HTMLButtonElement) {
    const p = products.find((x) => x.slug === slug);
    if (!p) return;
    const cal = feed(p);
    if (cal <= 0) return;
    playPop();
    grantCoins(2); // 喂食小奖励
    setLastReward({ id: `feed-${slug}-${Date.now()}`, coins: 2 });
    const r = btn.getBoundingClientRect();
    triggerFly({ fromX: r.left + r.width / 2, fromY: r.top + r.height / 2, coins: 2, color: "var(--gold)" });
  }

  function doWear(slug: string) {
    wear(slug);
    playPop();
  }

  if (!user || user.isAnonymous) {
    return (
      <section className="theme-home relative overflow-hidden">
        <div className="page-paint absolute inset-0 -z-10" aria-hidden />
        <div className="container-shell py-12 sm:py-20">
          <div className="rounded-[1.5rem] border border-white/60 bg-white/85 p-6 text-center shadow-sm sm:rounded-[2.5rem] sm:p-10">
            <h1 className="font-display text-3xl sm:text-5xl" style={{ color: "var(--page-ink)" }}>还没有分身</h1>
            <p className="mt-4" style={{ color: "var(--page-soft)" }}>注册账号后建一个 AI 分身，买的食物可以喂它、服饰给它穿，它会随卡路里和时间变胖变饿，还会跟你吐槽。</p>
            <ButtonLink href="/login" className="mt-8">去注册 / 登录</ButtonLink>
          </div>
        </div>
      </section>
    );
  }

  if (!avatar.created) {
    return (
      <section className="theme-home relative overflow-hidden">
        <div className="page-paint absolute inset-0 -z-10" aria-hidden />
        <div className="container-shell py-12 sm:py-20">
          <div className="mx-auto max-w-md rounded-[1.5rem] border border-white/60 bg-white/75 p-6 backdrop-blur sm:rounded-[2.5rem] sm:p-8">
            <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--hot)" }}>Avatar</p>
            <h1 className="font-display mt-3 text-3xl sm:text-4xl" style={{ color: "var(--page-ink)" }}>建个分身</h1>
            <p className="mt-3 text-sm leading-7" style={{ color: "var(--page-soft)" }}>选个形象、起个名、挑个色。你买的食物能喂它、服饰能给它穿，它会变胖变饿、跟你吐槽。</p>
            <div className="mt-6 flex justify-center"><AvatarBody mood="happy" color={color} shape={shape} size={180} /></div>
            <div className="mt-6 space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: "var(--page-ink)" }}>形象</p>
                <div className="grid grid-cols-3 gap-2">
                  {SHAPES.map((s) => (
                    <button key={s.id} onClick={() => setShape(s.id)} className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition ${shape === s.id ? "border-[var(--hot)] bg-[var(--hot)]/10" : "border-black/10 bg-white/60 hover:border-black/30"}`}>
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-xs" style={{ color: "var(--page-ink)" }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: "var(--page-ink)" }}>名字</p>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--hot)]" placeholder="小多" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: "var(--page-ink)" }}>主色</p>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)} aria-label={`选色 ${c}`} className={`h-9 w-9 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-[var(--page-ink)]" : ""}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
            <Button className="mt-8 w-full" onClick={() => createAvatar(name, color, shape)}>创建分身</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="theme-home relative overflow-hidden">
      <div className="page-paint absolute inset-0 -z-10" aria-hidden />
      <div className="container-shell py-10 sm:py-16">
        <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--hot)" }}>Avatar</p>
        <h1 className="font-display mt-3 text-3xl sm:text-4xl" style={{ color: "var(--page-ink)" }}>{avatar.name}</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          {/* 左：分身 + 状态 */}
          <div className="rounded-[1.5rem] border border-white/60 bg-white/65 p-6 backdrop-blur sm:rounded-[2rem]">
            <div className="flex justify-center"><AvatarBody weight={avatar.weight} mood={avatar.mood} color={avatar.color} shape={avatar.shape} wardrobe={avatar.wardrobe} size={220} /></div>
            {/* 反馈气泡 */}
            <div key={lineKey} className="card-enter mt-4 rounded-2xl bg-white/80 px-4 py-3 text-center text-sm font-medium" style={{ color: "var(--page-ink)" }}>
              “{line}”
            </div>
            {/* 状态环 */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              <Stat statKey="satiety" label="饱腹" value={avatar.satiety} onInfo={setStatModal} />
              <Stat statKey="hunger" label="饥饿" value={avatar.hunger} onInfo={setStatModal} />
              <Stat statKey="dopamine" label="多巴胺" value={avatar.dopamine} accent onInfo={setStatModal} />
              <Stat statKey="endorphin" label="内啡肽" value={avatar.endorphin} accent onInfo={setStatModal} />
              <Stat statKey="spirit" label="精神" value={avatar.spirit} danger={avatar.spirit < 30} onInfo={setStatModal} />
              <Stat statKey="calories" label="卡路里" value={avatar.calories} raw onInfo={setStatModal} />
              <Stat statKey="weight" label="体型" value={avatar.weight > 1.1 ? "圆润" : avatar.weight < 0.95 ? "清瘦" : "标准"} raw onInfo={setStatModal} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Button variant="ghost" onClick={openEdit}>✏️ 编辑分身</Button>
              <Button variant="ghost" onClick={() => { resetShape(); }}>重置形体</Button>
            </div>
          </div>

          {/* 右：编辑(展开时) + 喂食 + 衣橱 */}
          <div className="space-y-6">
            {editing && (
              <div className="slide-down rounded-[1.5rem] border border-[var(--hot)]/40 bg-white/80 p-5 backdrop-blur sm:rounded-[2rem]">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: "var(--page-ink)" }}>编辑分身</p>
                  <button onClick={() => setEditing(false)} className="text-sm" style={{ color: "var(--page-soft)" }}>取消</button>
                </div>
                <div className="flex justify-center"><AvatarBody mood={avatar.mood} color={editColor} shape={editShape} wardrobe={avatar.wardrobe} size={140} /></div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-semibold" style={{ color: "var(--page-ink)" }}>形象</p>
                    <div className="grid grid-cols-3 gap-2">
                      {SHAPES.map((s) => (
                        <button key={s.id} onClick={() => setEditShape(s.id)} className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition ${editShape === s.id ? "border-[var(--hot)] bg-[var(--hot)]/10" : "border-black/10 bg-white/60 hover:border-black/30"}`}>
                          <span className="text-2xl">{s.emoji}</span>
                          <span className="text-xs" style={{ color: "var(--page-ink)" }}>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold" style={{ color: "var(--page-ink)" }}>名字</p>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--hot)]" />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold" style={{ color: "var(--page-ink)" }}>主色</p>
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button key={c} onClick={() => setEditColor(c)} aria-label={`选色 ${c}`} className={`h-9 w-9 rounded-full transition ${editColor === c ? "ring-2 ring-offset-2 ring-[var(--page-ink)]" : ""}`} style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="mt-5 w-full" onClick={saveEdit}>保存</Button>
              </div>
            )}
            <div className="rounded-[1.5rem] border border-white/60 bg-white/65 p-5 backdrop-blur sm:rounded-[2rem]">
              <p className="text-sm font-semibold" style={{ color: "var(--page-ink)" }}>🍽️ 喂它（从你的订单）</p>
              {feedables.length === 0 ? (
                <p className="mt-3 text-sm" style={{ color: "var(--page-soft)" }}>还没有虚拟食物订单，去卡路里投影区点些餐再来喂它。</p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {feedables.map((p) => (
                    <button key={p.slug} onClick={(e) => doFeed(p.slug, e.currentTarget)} className="rounded-2xl border border-black/10 bg-white/70 p-3 text-left transition hover:border-[var(--hot)]/40 active:scale-95">
                      <p className="truncate text-sm font-semibold" style={{ color: "var(--page-ink)" }}>{p.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--page-soft)" }}>+{virtualCalories(p)} 卡</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-white/60 bg-white/65 p-5 backdrop-blur sm:rounded-[2rem]">
              <p className="text-sm font-semibold" style={{ color: "var(--page-ink)" }}>👕 给它穿（从你的订单）</p>
              {wearables.length === 0 ? (
                <p className="mt-3 text-sm" style={{ color: "var(--page-soft)" }}>还没有虚拟服饰订单，去赛博进货部买几件再来给它穿。</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {wearables.map((p) => {
                    const worn = avatar.wardrobe.includes(p.slug);
                    return (
                      <button key={p.slug} onClick={() => doWear(p.slug)} className={`rounded-full border px-3 py-2 text-sm transition active:scale-95 ${worn ? "border-[var(--hot)] bg-[var(--hot)] text-white" : "border-black/10 bg-white/70 hover:border-black/30"}`} style={worn ? undefined : { color: "var(--page-ink)" }}>
                        {worn ? "✓ " : ""}{p.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 状态解说弹层 */}
      {statModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setStatModal(null)} aria-hidden />
          <div className="relative w-full max-w-md slide-up sm:mx-auto">
            <StatModal statKey={statModal} onClose={() => setStatModal(null)} />
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ statKey, label, value, accent, danger, raw = false, onInfo }: { statKey: StatKey; label: string; value: string | number; accent?: boolean; danger?: boolean; raw?: boolean; onInfo: (k: StatKey) => void }) {
  // 0-100 的状态值显示成进度条 + 数字；raw 直接显示文本/大数
  const num = typeof value === "number" ? value : Number(value);
  const isNumeric = !raw && !Number.isNaN(num);
  const v = isNumeric ? num : null;
  const color = danger ? "var(--danger)" : accent ? "var(--hot)" : "var(--page-ink)";
  return (
    <button onClick={() => onInfo(statKey)} className="rounded-2xl bg-white/70 p-2.5 text-center transition hover:bg-white/90 active:scale-95 sm:p-3">
      <p className="text-[10px] sm:text-[11px]" style={{ color: "var(--page-soft)" }}>{label}</p>
      {isNumeric && v != null ? (
        <>
          <p className="font-display text-lg sm:text-xl" style={{ color }}>{v}</p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--muted) 18%, transparent)" }}>
            <span className="block h-full rounded-full" style={{ width: `${v}%`, background: danger ? "var(--danger)" : accent ? "var(--hot)" : "var(--page-ink)" }} />
          </div>
        </>
      ) : (
        <p className="font-display text-lg sm:text-xl" style={{ color }}>{value}</p>
      )}
    </button>
  );
}

function StatModal({ statKey, onClose }: { statKey: StatKey; onClose: () => void }) {
  const info = statInfo[statKey];
  return (
    <div className="rounded-t-[1.5rem] bg-white p-6 shadow-2xl sm:rounded-[1.5rem]" style={{ color: "var(--page-ink)" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-display flex items-center gap-2 text-xl"><span className="text-2xl">{info.emoji}</span>{info.title}</h3>
        <button onClick={onClose} className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-sm" style={{ color: "var(--page-ink)" }}>关闭</button>
      </div>
      <p className="mt-4 text-sm leading-7" style={{ color: "var(--page-soft)" }}>{info.what}</p>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--hot)" }}>如何提升</p>
        <ul className="mt-2 space-y-1.5">
          {info.how.map((h, i) => (
            <li key={i} className="flex gap-2 text-sm leading-6" style={{ color: "var(--page-ink)" }}>
              <span style={{ color: "var(--hot)" }}>•</span><span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
      {info.note && (
        <div className="mt-4 rounded-2xl bg-[color-mix(in_srgb,var(--page-accent)_18%,white)] p-4 text-xs leading-6" style={{ color: "var(--page-ink)" }}>
          {info.note}
        </div>
      )}
    </div>
  );
}
