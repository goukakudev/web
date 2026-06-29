"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { DenkiFrame } from "@/components/denki/DenkiFrame"
import {
  listClientExams,
  listClientQuestions,
} from "@/lib/client-exam-api"
import { getAllAnswers, getBookmarks } from "@/lib/local-store"
import type { ExamSummary, Question } from "@/lib/types"
import { examIdPrefixForSubject, type QuizSubject } from "@/lib/exam-utils"

export type ListMode = "history" | "bookmarks"
export type SubjectKey = QuizSubject

interface Row {
  questionId: string
  examId: string
  examTitle: string
  qNumber: number
  bodyPreview: string
  answeredAt?: string
}

export function QuestionListView({
  mode,
  subject = "fe",
  basePath,
  variant = "default",
}: {
  mode: ListMode
  subject?: SubjectKey
  basePath?: string
  variant?: "default" | "denki"
}) {
  const subjectPrefix = basePath ?? `/${subject}`
  const examIdPrefix = examIdPrefixForSubject(subject)
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
          mode === "bookmarks"
            ? [...bookmarks]
            : Object.keys(answers)
        const targetIds = allTargetIds.filter((id) => id.startsWith(examIdPrefix))
        if (targetIds.length === 0) {
          if (!cancelled) {
            setRows([])
            setLoading(false)
          }
          return
        }

        const exams: ExamSummary[] = await listClientExams(subject)
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

        const results: Map<string, Question[]> = new Map()
        await Promise.all(
          [...examIds].map(async (examId) => {
            try {
              const qs = await listClientQuestions(subject, examId)
              results.set(examId, qs)
            } catch {
              // ignore individual exam failures
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
              bodyPreview: q.body,
              answeredAt: a?.answered_at,
            })
          }
        }

        if (mode === "history") {
          collected.sort((a, b) => (b.answeredAt ?? "").localeCompare(a.answeredAt ?? ""))
        } else {
          collected.sort((a, b) =>
            (a.examId + a.qNumber).localeCompare(b.examId + b.qNumber),
          )
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
  }, [examIdPrefix, mode, subject])

  const content = (
    <>
      {variant === "default" ? (
        <Link href={subjectPrefix} className="inline-block text-[14px] mb-4">
          ← ホーム
        </Link>
      ) : null}
      {variant === "default" ? (
        <h1 className="text-[22px] font-extrabold mb-2">
          {mode === "history" ? "回答履歴" : "ブックマークした問題"}
        </h1>
      ) : null}
      <p className={variant === "denki" ? "mb-5 text-[12px] font-medium text-[#6c6252]" : "text-[12px] opacity-60 mb-5"}>
        {mode === "history"
          ? "回答した問題を新しい順に表示しています"
          : "ブックマークした問題を表示しています"}
      </p>

      {loading ? (
        <div className="py-12 text-center text-[12px] opacity-60">読み込み中...</div>
      ) : error ? (
        <div className="py-12 text-center text-[13px] opacity-70">{error}</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-[28px] mb-2">📭</div>
          <div className="text-[14px] font-bold">
            {mode === "history" ? "まだ回答した問題はありません" : "ブックマーク済みの問題はありません"}
          </div>
          <div className="text-[12px] opacity-60 mt-2">
            {mode === "history"
              ? "試験を選んで問題に挑戦してみよう"
              : "問題画面の ☆ ボタンでブックマークできます"}
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.questionId}>
              <Link
                href={`${subjectPrefix}/play/${r.examId}/q/${r.qNumber}`}
                className={
                  variant === "denki"
                    ? "block rounded-lg border border-[#d8d1bc] bg-[#fffdf6] p-3 transition hover:border-[#191815] hover:shadow-[3px_3px_0_#191815]"
                    : "block p-3 bg-goukaku-surface rounded-xl border border-goukaku-divider"
                }
              >
                <div className="text-[10px] tracking-wider font-bold opacity-55 uppercase">
                  {r.examId} · Q{r.qNumber}
                </div>
                <div className="text-[13px] font-semibold mt-1 line-clamp-2">
                  {r.bodyPreview}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )

  if (variant === "denki") {
    return (
      <DenkiFrame
        title={mode === "history" ? "回答履歴" : "ブックマークした問題"}
        eyebrow="MY PANEL"
        description={
          mode === "history"
            ? "第二種電気工事士の回答履歴を新しい順に確認できます。"
            : "第二種電気工事士でブックマークした問題だけを確認できます。"
        }
      >
        {content}
      </DenkiFrame>
    )
  }

  return <MobileFrame>{content}</MobileFrame>
}
