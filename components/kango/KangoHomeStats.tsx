"use client"
// ホームの学習サマリ (localStorage 集計)。SSR では出さず、マウント後に実値表示。
import { useState, useEffect } from "react"
import { kangoSummary, type KangoSummary } from "@/lib/kango/store"
import { Donut } from "./ui"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: "10px 12px",
        borderRadius: 14,
        background: "var(--color-kn-surface-2)",
      }}
    >
      <span style={{ fontSize: 11, color: "var(--color-kn-text-3)" }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 800, color: "var(--color-kn-text-1)" }}>{value}</span>
    </div>
  )
}

export function KangoHomeStats() {
  const [s, setS] = useState<KangoSummary | null>(null)
  useEffect(() => {
    queueMicrotask(() => setS(kangoSummary()))
  }, [])
  if (!s) return null
  return (
    <div className="kn-card" style={{ padding: 18, marginTop: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-kn-text-1)", margin: "0 0 14px" }}>学習の記録</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <Donut value={s.accuracyPercent} size={116} />
        <div style={{ flex: "1 1 200px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Stat label="解答数" value={`${s.answered}`} />
          <Stat label="正解数" value={`${s.correct}`} />
          <Stat label="連続正解" value={`${s.currentStreak}`} />
          <Stat label="学習日数" value={`${s.studyDays}日`} />
        </div>
      </div>
    </div>
  )
}
