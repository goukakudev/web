"use client";

import { useEffect, useState } from "react";
import { aggregateStats } from "@/lib/takken/stats";

export default function StatsClient() {
  const [stats, setStats] = useState<ReturnType<typeof aggregateStats> | null>(
    null,
  );

  useEffect(() => {
    queueMicrotask(() => setStats(aggregateStats()));
  }, []);

  if (!stats) {
    return (
      <div className="mt-8 rounded-2xl border border-tk-line bg-tk-card p-6 text-sm text-tk-ink-3">
        読み込み中…
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-tk-line bg-tk-card p-8 text-center">
        <p className="font-mincho text-base text-tk-ink">
          まだ解答ログがありません
        </p>
        <p className="mt-2 text-xs tracking-wide text-tk-ink-3">
          問題を解くと、こちらに学習統計が表示されます
        </p>
      </div>
    );
  }

  const accuracyPct = Math.round(stats.accuracy * 100);
  const wrongPct = stats.total > 0 ? Math.round((stats.wrong / stats.total) * 100) : 0;
  const maxDay = stats.recentDays.reduce((m, d) => Math.max(m, d.total), 0);

  return (
    <div className="mt-8 space-y-6">
      {/* 集計カード */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="正解率" value={`${accuracyPct}%`} tone="gold" />
        <StatCard label="誤答率" value={`${wrongPct}%`} tone="crimson" />
        <StatCard label="解答数" value={`${stats.total}`} tone="neutral" />
      </div>

      {/* 7日棒グラフ */}
      <section className="rounded-2xl border border-tk-line bg-tk-card p-5">
        <h2 className="font-mincho text-sm tracking-widest text-tk-ink-3">
          直近 7 日の解答数
        </h2>
        <div className="mt-4 flex h-32 items-end gap-2">
          {stats.recentDays.map((d) => {
            const heightPct =
              maxDay > 0 ? (d.total / maxDay) * 100 : 0;
            const correctPct =
              d.total > 0 ? (d.correct / d.total) * heightPct : 0;
            const wrongRemainPct = heightPct - correctPct;
            const label = d.date.slice(5); // MM-DD
            return (
              <div
                key={d.date}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div className="relative w-full flex-1">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t bg-tk-canvas"
                    style={{ height: `${wrongRemainPct}%` }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t bg-tk-gold"
                    style={{ height: `${correctPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-tk-ink-3">{label}</span>
                <span className="text-[10px] font-medium text-tk-ink-2">
                  {d.total}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-end gap-3 text-[10px] text-tk-ink-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-tk-gold" /> 正解
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-tk-canvas" /> 不正解
          </span>
        </div>
      </section>

      {/* 詳細 */}
      <section className="rounded-2xl border border-tk-line bg-tk-card p-5">
        <h2 className="font-mincho text-sm tracking-widest text-tk-ink-3">
          詳細
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-tk-ink-3">解答数</dt>
          <dd className="text-right font-mincho text-tk-ink">{stats.total}</dd>
          <dt className="text-tk-ink-3">正解数</dt>
          <dd className="text-right font-mincho text-tk-gold">{stats.correct}</dd>
          <dt className="text-tk-ink-3">誤答数</dt>
          <dd className="text-right font-mincho text-tk-crimson">
            {stats.wrong}
          </dd>
          <dt className="text-tk-ink-3">扱った問題</dt>
          <dd className="text-right font-mincho text-tk-ink">
            {stats.uniqueQuestions}
          </dd>
        </dl>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "gold" | "crimson" | "neutral";
}) {
  const valueClass =
    tone === "gold"
      ? "text-tk-gold"
      : tone === "crimson"
        ? "text-tk-crimson"
        : "text-tk-ink";
  return (
    <div className="rounded-2xl border border-tk-line bg-tk-card p-4 text-center">
      <p className="text-[10px] tracking-widest text-tk-ink-3">{label}</p>
      <p className={`mt-2 font-mincho text-3xl font-medium ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
