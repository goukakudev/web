"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getAllAnswers } from "@/lib/local-store"

export function HistoryCard({ subject = "fe" }: { subject?: "fe" | "ip" | "ap" } = {}) {
  const [stats, setStats] = useState<{ total: number; examCount: number } | null>(null)
  const examIdPrefix = `${subject}-`

  useEffect(() => {
    const map = getAllAnswers()
    const exams = new Set<string>()
    let total = 0
    for (const rec of Object.values(map)) {
      if (!rec.exam_id.startsWith(examIdPrefix)) continue
      exams.add(rec.exam_id)
      total++
    }
    setStats({ total, examCount: exams.size })
  }, [examIdPrefix])

  if (!stats || stats.total === 0) return null

  return (
    <section className="mb-7">
      <div className="text-[22px] text-goukaku-pink-script mb-1" style={{ fontFamily: "var(--font-script)" }}>
        History
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">回答履歴</div>
      <Link
        href={`/${subject}/history`}
        className="block p-4 bg-goukaku-surface rounded-2xl border border-goukaku-divider"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-goukaku-cool/45 flex items-center justify-center text-[18px]">
            🕐
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-extrabold">
              {stats.examCount} 試験 · {stats.total} 問
            </div>
            <div className="text-[11px] opacity-60 mt-0.5">
              回答した問題を新しい順に
            </div>
          </div>
          <div className="text-[14px] font-bold opacity-60">→</div>
        </div>
      </Link>
    </section>
  )
}
