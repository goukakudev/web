"use client";

import { useEffect, useState } from "react";
import { aggregateStats } from "@/lib/takken/stats";

/**
 * ホーム画面に置く学習統計サマリ。和風モダン (アイボリー × tk-gold) で表示。
 */
export function TakkenHomeStats() {
  const [stats, setStats] = useState<ReturnType<typeof aggregateStats> | null>(
    null,
  );

  useEffect(() => {
    queueMicrotask(() => setStats(aggregateStats()));
  }, []);

  if (!stats) return null;

  const accuracyPct = Math.round(stats.accuracy * 100);
  const wrongPct =
    stats.total > 0 ? Math.round((stats.wrong / stats.total) * 100) : 0;
  const maxDay = stats.recentDays.reduce((m, d) => Math.max(m, d.total), 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <StatCell label="正解率" value={`${accuracyPct}%`} tone="gold" />
        <StatCell label="誤答率" value={`${wrongPct}%`} tone="crimson" />
        <StatCell label="解答数" value={`${stats.total}`} tone="neutral" />
      </div>

      {/* 7日棒グラフ */}
      <div className="mt-4">
        <p className="text-[10px] tracking-widest text-tk-ink-3">直近7日</p>
        <div className="mt-2 flex h-14 items-end gap-1.5">
          {stats.recentDays.map((d) => {
            const heightPct = maxDay > 0 ? (d.total / maxDay) * 100 : 0;
            const correctPct =
              d.total > 0 ? (d.correct / d.total) * heightPct : 0;
            const wrongRemain = heightPct - correctPct;
            return (
              <div
                key={d.date}
                className="flex flex-1 flex-col items-center gap-0.5"
              >
                <div className="relative w-full flex-1 rounded-t bg-tk-canvas">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t bg-tk-line"
                    style={{ height: `${wrongRemain}%` }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t bg-tk-gold"
                    style={{ height: `${correctPct}%` }}
                  />
                </div>
                <span className="text-[8px] text-tk-ink-3">
                  {d.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCell({
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
    <div>
      <p className="text-[10px] tracking-widest text-tk-ink-3">{label}</p>
      <p className={`mt-1 font-mincho text-2xl font-medium ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
