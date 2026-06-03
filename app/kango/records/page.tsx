"use client"
// 学習記録 (localStorage 集計で完結。SSR では空、マウント後に実値)。iOS RecordsScreen 相当。
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  kangoSummary,
  kangoExamBreakdown,
  type KangoSummary,
} from "@/lib/kango/store"
import { examLabelFromId } from "@/lib/kango/exam"
import { Donut, ProgressBar } from "@/components/kango/ui"
import { KangoNav, KangoBreadcrumb } from "@/components/kango/KangoNav"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "12px 14px", borderRadius: 14, background: "var(--color-kn-surface-2)" }}>
      <span style={{ fontSize: 11, color: "var(--color-kn-text-3)" }}>{label}</span>
      <span style={{ fontSize: 20, fontWeight: 800, color: "var(--color-kn-text-1)" }}>{value}</span>
    </div>
  )
}

export default function KangoRecordsPage() {
  const [s, setS] = useState<KangoSummary | null>(null)
  const [breakdown, setBreakdown] = useState<Record<string, { answered: number; correct: number }>>({})
  useEffect(() => {
    setS(kangoSummary())
    setBreakdown(kangoExamBreakdown())
  }, [])

  const examEntries = Object.entries(breakdown).sort((a, b) => b[1].answered - a[1].answered)
  const empty = !s || s.answered === 0

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 48px" }}>
        <KangoBreadcrumb
          items={[
            { name: "合格.dev", href: "/" },
            { name: "看護", href: "/kango" },
            { name: "学習記録", href: "/kango/records" },
          ]}
        />
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-kn-text-1)", margin: "0 0 16px" }}>学習の記録</h1>

        {empty ? (
          <div className="kn-card" style={{ padding: 28, textAlign: "center" }}>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--color-kn-text-2)", margin: 0 }}>まだ記録がありません</p>
            <p style={{ fontSize: 12.5, color: "var(--color-kn-text-3)", margin: "6px 0 16px" }}>問題を解くと、正解率や学習日数がここに集計されます。</p>
            <Link href="/kango" className="kn-btn-primary" style={{ textDecoration: "none", maxWidth: 240, margin: "0 auto" }}>
              問題を解く
            </Link>
          </div>
        ) : (
          <>
            <div className="kn-card" style={{ padding: 18, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <Donut value={s!.accuracyPercent} size={132} />
                <div style={{ flex: "1 1 220px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Stat label="解答数" value={`${s!.answered}`} />
                  <Stat label="正解数" value={`${s!.correct}`} />
                  <Stat label="連続正解" value={`${s!.currentStreak}`} />
                  <Stat label="学習日数" value={`${s!.studyDays}日`} />
                </div>
              </div>
            </div>

            {examEntries.length > 0 && (
              <section>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-kn-text-1)", margin: "8px 0 10px" }}>試験別の進捗</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {examEntries.map(([eid, b]) => (
                    <Link key={eid} href={`/kango/exam/${eid}`} className="kn-card" style={{ padding: 14, textDecoration: "none", display: "block" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-kn-text-1)" }}>{examLabelFromId(eid)}</span>
                        <span style={{ fontSize: 12.5, color: "var(--color-kn-text-2)" }}>
                          {b.correct}/{b.answered}問 正解 ({b.answered ? Math.round((b.correct / b.answered) * 100) : 0}%)
                        </span>
                      </div>
                      <ProgressBar value={b.answered ? b.correct / b.answered : 0} />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <footer style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--color-kn-line)" }}>
          <KangoNav current="/kango/records" />
        </footer>
      </div>
    </main>
  )
}
