"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { listScExams, listScQuestions } from "@/lib/api-client"
import { getAllAnswers, getBookmarks } from "@/lib/local-store"
import type { Question, ExamSummary } from "@/lib/types"

export type ScListMode = "history" | "bookmarks"

interface Row {
  questionId: string
  examId: string
  examTitle: string
  qNumber: number
  bodyPreview: string
  answeredAt?: string
}

function stripPlain(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/[#*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function ScQuestionList({ mode }: { mode: ScListMode }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const answers = getAllAnswers()
        const bookmarks = getBookmarks()
        const allTargetIds =
          mode === "bookmarks" ? [...bookmarks] : Object.keys(answers)
        const targetIds = allTargetIds.filter((id) => id.startsWith("sc-"))
        if (targetIds.length === 0) {
          if (!cancelled) {
            setRows([])
            setLoading(false)
          }
          return
        }
        const exams: ExamSummary[] = await listScExams()
        const titleByExam = new Map(exams.map((e) => [e.exam_id, e.title ?? e.exam_id]))
        const examIds = new Set<string>()
        for (const id of targetIds) {
          for (const e of exams) {
            if (id.startsWith(`${e.exam_id}-`)) {
              examIds.add(e.exam_id)
              break
            }
          }
        }
        const results = new Map<string, Question[]>()
        await Promise.all(
          [...examIds].map(async (examId) => {
            try {
              const qs = await listScQuestions(examId)
              results.set(examId, qs)
            } catch {
              // ignore
            }
          }),
        )
        const targetSet = new Set(targetIds)
        const collected: Row[] = []
        for (const [examId, qs] of results) {
          for (const q of qs) {
            if (!targetSet.has(q._id)) continue
            const a = answers[q._id]
            collected.push({
              questionId: q._id,
              examId,
              examTitle: titleByExam.get(examId) ?? examId,
              qNumber: q.q_number,
              bodyPreview: stripPlain(q.body),
              answeredAt: a?.answered_at,
            })
          }
        }
        if (mode === "history") {
          collected.sort((a, b) => (b.answeredAt ?? "").localeCompare(a.answeredAt ?? ""))
        } else {
          collected.sort((a, b) => (a.examId + a.qNumber).localeCompare(b.examId + b.qNumber))
        }
        if (!cancelled) {
          setRows(collected)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError("読み込みに失敗しました。通信を確認してください。")
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [mode])

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-sc-t3)", fontSize: "0.75rem" }}>
        読み込み中…
      </p>
    )
  }
  if (error) {
    return (
      <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-sc-t2)", fontSize: "0.8125rem" }}>
        {error}
      </p>
    )
  }
  if (rows.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1.375rem 0" }}>
        <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }} aria-hidden>📭</div>
        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-sc-ink)" }}>
          {mode === "history"
            ? "まだ回答した問題はありません"
            : "ブックマーク済みの問題はありません"}
        </div>
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--color-sc-t3)" }}>
          {mode === "history"
            ? "試験を選んで問題に挑戦してみよう"
            : "問題画面の ☆ ボタンでブックマークできます"}
        </div>
      </div>
    )
  }

  return (
    <div className="sc-q-list">
      {rows.map((r) => (
        <Link
          key={r.questionId}
          href={`/sc/play/${r.examId}/q/${r.qNumber}`}
          className="sc-q-row"
        >
          <span className="sc-q-row-num">{r.examId.replace(/^sc-/, "")} 問 {r.qNumber}</span>
          <span className="sc-q-row-text">{r.bodyPreview.slice(0, 64)}{r.bodyPreview.length > 64 ? "…" : ""}</span>
        </Link>
      ))}
    </div>
  )
}
