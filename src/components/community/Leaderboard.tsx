"use client";

import { useEffect, useMemo, useState } from "react";
import { useLeaderboardStore, type LeaderboardScope, type LeaderboardRow } from "@/stores/leaderboard-store";
import { useAuthStore } from "@/stores/auth-store";

type Metric = {
  key: keyof Pick<LeaderboardRow, "saved" | "calories" | "coins" | "restraints" | "streak">;
  label: string;
  unit: string;
  icon: string;
  desc: string;
};

const METRICS: Metric[] = [
  { key: "saved", label: "省钱", unit: "¥", icon: "💸", desc: "今日忍住的冲动消费" },
  { key: "calories", label: "卡路里", unit: "大卡", icon: "🔥", desc: "趣味换算 ¥1≈8 大卡" },
  { key: "coins", label: "多巴胺", unit: "克", icon: "✨", desc: "克制收获的奖励币" },
  { key: "restraints", label: "剁手抑制", unit: "次", icon: "✋", desc: "拦截的剁手冲动" },
  { key: "streak", label: "连签", unit: "天", icon: "📅", desc: "连续自律打卡" },
];

function fmt(value: number, unit: string) {
  return unit === "¥" ? `¥${value.toLocaleString("zh-CN")}` : `${value.toLocaleString("zh-CN")} ${unit}`.trim();
}

export function Leaderboard() {
  const [scope, setScope] = useState<LeaderboardScope>("today");
  const [metric, setMetric] = useState<Metric["key"]>("saved");
  const { rows, loading, loaded, load } = useLeaderboardStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    void load(scope);
  }, [scope, load]);

  const ranked = useMemo(() => {
    const sorted = [...rows].sort((a, b) => Number(b[metric]) - Number(a[metric]));
    return sorted.slice(0, 10);
  }, [rows, metric]);

  const myRank = useMemo(() => {
    if (!user) return null;
    const sorted = [...rows].sort((a, b) => Number(b[metric]) - Number(a[metric]));
    const idx = sorted.findIndex((r) => r.user_id === user.id);
    if (idx < 0) return null;
    return { rank: idx + 1, row: sorted[idx] };
  }, [rows, metric, user]);

  const activeMetric = METRICS.find((m) => m.key === metric)!;

  return (
    <section className="rounded-[1.5rem] border border-white/50 bg-white/65 p-4 backdrop-blur sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--hot)]">Self-Discipline Rank</p>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl" style={{ color: "var(--page-ink)" }}>自律省钱榜</h2>
          <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">虚拟下单 = ¥0 真实支付，每一单都是忍住的冲动。{activeMetric.desc}</p>
        </div>
        {/* 今日 / 累计 */}
        <div className="inline-flex w-fit shrink-0 rounded-full border border-black/10 bg-white/70 p-1 text-sm">
          {(["today", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`rounded-full px-4 py-1.5 transition ${scope === s ? "bg-[var(--ink)] text-[var(--bone)]" : "text-[var(--muted)]"}`}
            >
              {s === "today" ? "今日" : "累计"}
            </button>
          ))}
        </div>
      </div>

      {/* 指标 tab */}
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
              metric === m.key ? "border-[var(--hot)] bg-[var(--hot)] text-white" : "border-black/10 bg-white/70 text-[var(--muted)]"
            }`}
          >
            <span>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* 榜单 */}
      <ol className="mt-4 space-y-1.5">
        {loading && <li className="py-6 text-center text-sm text-[var(--muted)]">加载中…</li>}
        {!loading && loaded && ranked.length === 0 && (
          <li className="py-6 text-center text-sm text-[var(--muted)]">还没有人上榜，下第一单就是你榜首。</li>
        )}
        {ranked.map((row, i) => {
          const me = user && row.user_id === user.id;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
          return (
            <li
              key={row.user_id}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${me ? "border border-[var(--hot)] bg-[color-mix(in_srgb,var(--hot)_12%,white)]" : i < 3 ? "bg-white/70" : ""}`}
            >
              <span className="w-7 shrink-0 text-center font-display text-lg" style={{ color: "var(--page-ink)" }}>{medal ?? i + 1}</span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm text-white" style={{ background: row.avatar_color ?? "var(--ink)" }}>
                {(row.username ?? "?").slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold" style={{ color: "var(--page-ink)" }}>
                {row.username ?? "匿名仓友"}{me && <span className="ml-1 text-xs text-[var(--hot)]">（你）</span>}
              </span>
              <span className="shrink-0 font-display text-base sm:text-lg" style={{ color: "var(--page-ink)" }}>{fmt(Number(row[metric]), activeMetric.unit)}</span>
            </li>
          );
        })}
      </ol>

      {/* 我的排名（不在前 10 时显示） */}
      {myRank && myRank.rank > 10 && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--hot)] bg-[color-mix(in_srgb,var(--hot)_12%,white)] px-3 py-2.5">
          <span className="w-7 shrink-0 text-center font-display text-lg text-[var(--hot)]">{myRank.rank}</span>
          <span className="min-w-0 flex-1 truncate font-semibold text-[var(--hot)]">你</span>
          <span className="shrink-0 font-display text-base text-[var(--hot)]">{fmt(Number(myRank.row[metric]), activeMetric.unit)}</span>
        </div>
      )}
      {loaded && !loading && !user && (
        <p className="mt-3 text-center text-xs text-[var(--muted)]">登录后下单即可上榜，进度会继承匿名浏览的记录。</p>
      )}
    </section>
  );
}
