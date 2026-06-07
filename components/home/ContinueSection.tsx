"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { ExamSummary } from "@/lib/types"
import { shortTitle } from "@/lib/exam-utils"
import { loadExamSessions, type ExamSession } from "@/lib/exam-session"

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const diffMs = Date.now() - then
  const m = Math.floor(diffMs / 60_000)
  if (m < 1) return "たった今"
  if (m < 60) return `${m} 分前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 時間前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} 日前`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo} か月前`
  return `${Math.floor(mo / 12)} 年前`
}

function accuracyPercent(s: ExamSession): number {
  if (s.answered === 0) return 0
  return Math.round((s.correct / s.answered) * 100)
}

export function ContinueSection({
  exams,
  subject = "fe",
}: {
  exams: ExamSummary[]
  subject?: "fe" | "ip" | "ap" | "sg" | "sc"
}) {
  const [latest, setLatest] = useState<ExamSession | null>(null)
  const examIdPrefix = `${subject}-`

  useEffect(() => {
    const sessions = loadExamSessions()
    const filtered = sessions.filter((s) => s.exam_id.startsWith(examIdPrefix))
    setLatest(filtered[0] ?? null)
  }, [examIdPrefix])

  const exam = useMemo(() => {
    if (!latest) return undefined
    return exams.find((e) => e.exam_id === latest.exam_id)
  }, [latest, exams])

  if (!latest || !exam) return null

  const examUrl = `/${subject}/exam/${exam.exam_id}`

  return (
    <div className="mt-7">
      <div className="text-[22px] text-goukaku-pink-script" style={{ fontFamily: "var(--font-script)" }}>
        Continue
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">続きから</div>
      <Link
        href={examUrl}
        className="flex items-center gap-3 rounded-[20px] bg-goukaku-surface p-4"
      >
        <div className="w-11 h-11 rounded-full bg-goukaku-cool flex items-center justify-center text-[18px]">
          ↩
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-goukaku-ink line-clamp-2">
            {shortTitle(exam)}
          </div>
          <div className="text-[11px] text-goukaku-ink/55 mt-1">
            前回 {accuracyPercent(latest)}% · {relativeTime(latest.finished_at)}
          </div>
        </div>
        <div className="text-[13px] font-bold text-goukaku-ink">→</div>
      </Link>
    </div>
  )
}
