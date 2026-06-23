"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getBookmarks } from "@/lib/local-store"
import type { ExamSummary } from "@/lib/types"
import { examIdPrefixForSubject, type QuizSubject } from "@/lib/exam-utils"

export function BookmarkCard({
  exams,
  subject = "fe",
}: {
  exams: ExamSummary[]
  subject?: QuizSubject
}) {
  const [counts, setCounts] = useState<{ total: number; examCount: number } | null>(null)
  const examIdPrefix = examIdPrefixForSubject(subject)

  useEffect(() => {
    const all = getBookmarks()
    const filtered = [...all].filter((id) => id.startsWith(examIdPrefix))
    const seenExams = new Set<string>()
    for (const id of filtered) {
      for (const e of exams) {
        if (id.startsWith(`${e.exam_id}-`)) {
          seenExams.add(e.exam_id)
          break
        }
      }
    }
    setCounts({ total: filtered.length, examCount: seenExams.size })
  }, [exams, examIdPrefix])

  if (!counts || counts.total === 0) return null

  return (
    <section className="mb-7">
      <div className="text-[22px] text-goukaku-pink-script mb-1" style={{ fontFamily: "var(--font-script)" }}>
        Bookmarks
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">ブックマークした試験</div>
      <Link
        href={`/${subject}/bookmarks`}
        className="block p-4 bg-goukaku-surface rounded-2xl border border-goukaku-divider"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-goukaku-pink-script/15 flex items-center justify-center text-[18px]">
            ★
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-extrabold">
              {counts.examCount} 試験 · {counts.total} 問
            </div>
            <div className="text-[11px] opacity-60 mt-0.5">
              タップで一覧
            </div>
          </div>
          <div className="text-[14px] font-bold opacity-60">→</div>
        </div>
      </Link>
    </section>
  )
}
