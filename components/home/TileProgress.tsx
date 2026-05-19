"use client"

import { useEffect, useState } from "react"
import { getExamStats, type ExamStats } from "@/lib/local-store"

export function TileProgress({
  examId,
  total,
  colorClass,
}: {
  examId: string
  total: number
  colorClass: string
}) {
  const [stats, setStats] = useState<ExamStats | null>(null)

  useEffect(() => {
    setStats(getExamStats(examId, total))
  }, [examId, total])

  if (!stats || stats.answered === 0) {
    return (
      <div className="mt-2 text-[11px] text-goukaku-ink/60">{total} 問</div>
    )
  }

  const accuracyPct = Math.round((stats.correct / stats.answered) * 100)
  const answeredPct = Math.min(100, Math.round((stats.answered / Math.max(1, total)) * 100))

  return (
    <div className="mt-2">
      <div className="text-[11px] text-goukaku-ink/60">
        {stats.answered}/{total} 問 · {accuracyPct}%
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-goukaku-ink/10 overflow-hidden">
        <div
          className={`${colorClass} h-full rounded-full transition-all`}
          style={{ width: `${answeredPct}%` }}
        />
      </div>
    </div>
  )
}
