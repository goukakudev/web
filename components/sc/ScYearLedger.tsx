"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { ExamSummary } from "@/lib/types"
import { getAllAnswers } from "@/lib/local-store"
import { ScHairline } from "./ScChrome"

/** "2025r07h" → "令和7" / "2014h26h" → "平成26" */
function warekiShort(year: string): string {
  if (!year || year.length < 7) return ""
  const era = year[4]
  const eraName = era === "r" ? "令和" : era === "h" ? "平成" : ""
  if (!eraName) return ""
  const n = parseInt(year.slice(5, 7), 10)
  if (Number.isNaN(n)) return ""
  return `${eraName}${n}`
}

function westernYear(year: string): string {
  return year.slice(0, 4) || year
}

interface Stats {
  answered: number
  correct: number
}

function readStatsByExam(): Map<string, Stats> {
  const out = new Map<string, Stats>()
  const map = getAllAnswers()
  for (const rec of Object.values(map)) {
    const s = out.get(rec.exam_id) ?? { answered: 0, correct: 0 }
    s.answered += 1
    if (rec.correct_label && rec.correct_label === rec.selected_label) s.correct += 1
    out.set(rec.exam_id, s)
  }
  return out
}

export function ScYearLedger({ exams }: { exams: ExamSummary[] }) {
  const [statsByExam, setStatsByExam] = useState<Map<string, Stats>>(new Map())
  useEffect(() => {
    setStatsByExam(readStatsByExam())
  }, [])

  return (
    <div className="sc-ledger">
      {exams.map((exam) => {
        const s = statsByExam.get(exam.exam_id) ?? { answered: 0, correct: 0 }
        const pct = s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : 0
        const state: "ongoing" | "untouched" | "done" =
          s.answered === 0 ? "untouched" : s.answered >= exam.question_count && pct >= 80 ? "done" : "ongoing"
        const label = state === "done" ? "完了" : state === "ongoing" ? "学習中" : "未着手"
        const title = exam.title ?? `${exam.year} ${exam.section}`
        return (
          <div key={exam.exam_id}>
            <Link href={`/sc/exam/${exam.exam_id}`} className="sc-ledger-row">
              <div className="sc-ledger-year">
                <div className="sc-ledger-year-num">{westernYear(exam.year)}</div>
                <div className="sc-ledger-year-wareki">{warekiShort(exam.year)}</div>
              </div>
              <div className="sc-ledger-main">
                <div className="sc-ledger-head">
                  <span className="sc-ledger-title">{title}</span>
                  <span
                    className="sc-ledger-status"
                    data-state={state === "done" ? "done" : state === "ongoing" ? "ongoing" : undefined}
                  >
                    {label}
                  </span>
                </div>
                <div className="sc-ledger-meta">全 {exam.question_count} 問</div>
                <div className="sc-ledger-bar">
                  <div className="sc-ledger-bar-track">
                    <span
                      className="sc-ledger-bar-fill"
                      data-good={pct >= 80 ? "true" : "false"}
                      style={{ width: `${s.answered > 0 ? pct : 0}%` }}
                    />
                  </div>
                  {s.answered > 0 ? (
                    <span className="sc-ledger-bar-value">{pct}%</span>
                  ) : (
                    <span className="sc-ledger-bar-empty">未受験</span>
                  )}
                </div>
              </div>
              <span className="sc-ledger-arrow" aria-hidden>
                ›
              </span>
            </Link>
            <ScHairline />
          </div>
        )
      })}
    </div>
  )
}
