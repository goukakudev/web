"use client"

import { useEffect, useMemo, useState } from "react"
import { listExams, listQuestions } from "@/lib/api-client"
import { getAllAnswers } from "@/lib/local-store"
import type { Question, ExamSummary } from "@/lib/types"

export interface StudyDaysModalProps {
  open: boolean
  onClose: () => void
}

interface WrongRow {
  questionId: string
  examId: string
  qNumber: number
  bodyPreview: string
}

export function StudyDaysModal({ open, onClose }: StudyDaysModalProps) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
  const [wrongRows, setWrongRows] = useState<WrongRow[]>([])
  const [wrongLoading, setWrongLoading] = useState(false)
  const [wrongError, setWrongError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedDayKey) {
          setSelectedDayKey(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, selectedDayKey])

  const { studyDayKeys, streakDays, totalDays } = useMemo(() => {
    if (!open) return { studyDayKeys: new Set<string>(), streakDays: 0, totalDays: 0 }
    const map = getAllAnswers()
    const keys = new Set<string>()
    for (const rec of Object.values(map)) {
      keys.add(toDayKey(new Date(rec.answered_at)))
    }
    return {
      studyDayKeys: keys,
      streakDays: computeStreak(keys, new Date()),
      totalDays: keys.size,
    }
  }, [open])

  // load wrong answers for the selected day
  useEffect(() => {
    if (!selectedDayKey) {
      setWrongRows([])
      setWrongError(null)
      setWrongLoading(false)
      return
    }
    let cancelled = false
    const run = async () => {
      setWrongLoading(true)
      setWrongError(null)
      setWrongRows([])
      const dayStart = new Date(selectedDayKey + "T00:00:00")
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayStart.getDate() + 1)

      const answers = getAllAnswers()
      const wrongRecords = Object.values(answers).filter((r) => {
        if (!r.correct_label) return false
        if (r.correct_label === r.selected_label) return false
        const t = new Date(r.answered_at).getTime()
        return t >= dayStart.getTime() && t < dayEnd.getTime()
      })
      if (wrongRecords.length === 0) {
        if (!cancelled) {
          setWrongRows([])
          setWrongLoading(false)
        }
        return
      }
      try {
        const exams: ExamSummary[] = await listExams()
        const examIds = new Set(wrongRecords.map((r) => r.exam_id))
        const idToTitle = new Map(exams.map((e) => [e.exam_id, e.title ?? e.exam_id]))
        const lists: Map<string, Question[]> = new Map()
        await Promise.all(
          [...examIds].map(async (id) => {
            try {
              lists.set(id, await listQuestions(id))
            } catch {
              // ignore individual exam failure
            }
          }),
        )
        const wrongQids = new Set(wrongRecords.map((r) => r.question_id))
        const rows: WrongRow[] = []
        for (const [examId, qs] of lists) {
          for (const q of qs) {
            if (!wrongQids.has(q._id)) continue
            rows.push({
              questionId: q._id,
              examId,
              qNumber: q.q_number,
              bodyPreview: q.body,
            })
            void idToTitle
          }
        }
        rows.sort((a, b) => a.examId.localeCompare(b.examId) || a.qNumber - b.qNumber)
        if (!cancelled) {
          setWrongRows(rows)
          setWrongLoading(false)
        }
      } catch {
        if (!cancelled) {
          setWrongError("問題の取得に失敗しました")
          setWrongLoading(false)
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [selectedDayKey])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full sm:max-w-md bg-goukaku-bg rounded-t-[20px] sm:rounded-[20px] border border-goukaku-divider shadow-xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {selectedDayKey ? (
          <WrongList
            dayKey={selectedDayKey}
            rows={wrongRows}
            loading={wrongLoading}
            error={wrongError}
            onBack={() => setSelectedDayKey(null)}
            onJump={onClose}
          />
        ) : (
          <CalendarView
            visibleMonth={visibleMonth}
            setVisibleMonth={setVisibleMonth}
            studyDayKeys={studyDayKeys}
            streakDays={streakDays}
            totalDays={totalDays}
            onSelectDay={setSelectedDayKey}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

function CalendarView({
  visibleMonth,
  setVisibleMonth,
  studyDayKeys,
  streakDays,
  totalDays,
  onSelectDay,
  onClose,
}: {
  visibleMonth: Date
  setVisibleMonth: (d: Date) => void
  studyDayKeys: Set<string>
  streakDays: number
  totalDays: number
  onSelectDay: (key: string) => void
  onClose: () => void
}) {
  const todayKey = toDayKey(new Date())
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const canGoForward = visibleMonth < thisMonthStart

  const monthLabel = `${visibleMonth.getFullYear()}年 ${visibleMonth.getMonth() + 1}月`
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate()
  const firstWeekday = visibleMonth.getDay()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), d))
  }
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-3 p-5 border-b border-goukaku-divider">
        <div className="flex-1 min-w-0">
          <div
            className="text-[22px] text-goukaku-pink-script leading-none"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Streak
          </div>
          <div className="mt-1 text-[18px] font-extrabold">学習履歴</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="w-8 h-8 rounded-full bg-goukaku-surface border border-goukaku-divider text-[14px] flex items-center justify-center"
        >
          ×
        </button>
      </div>
      <div className="p-5 space-y-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          <PillStat icon="🔥" value={streakDays} unit="日連続" />
          <PillStat icon="📅" value={totalDays} unit="日学習" />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const prev = new Date(visibleMonth)
              prev.setMonth(prev.getMonth() - 1)
              setVisibleMonth(prev)
            }}
            className="w-8 h-8 rounded-full bg-goukaku-surface flex items-center justify-center text-[13px]"
            aria-label="前の月"
          >
            ‹
          </button>
          <div className="text-[15px] font-extrabold tabular-nums">{monthLabel}</div>
          <button
            type="button"
            disabled={!canGoForward}
            onClick={() => {
              if (!canGoForward) return
              const nx = new Date(visibleMonth)
              nx.setMonth(nx.getMonth() + 1)
              setVisibleMonth(nx)
            }}
            className={`w-8 h-8 rounded-full bg-goukaku-surface flex items-center justify-center text-[13px] ${
              canGoForward ? "" : "opacity-30"
            }`}
            aria-label="次の月"
          >
            ›
          </button>
        </div>

        <div className="p-3 rounded-2xl border border-goukaku-divider bg-goukaku-surface/50">
          <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[10px] font-extrabold opacity-60">
            <div className="text-red-500/80">日</div>
            <div>月</div>
            <div>火</div>
            <div>水</div>
            <div>木</div>
            <div>金</div>
            <div className="text-blue-500/80">土</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, idx) => {
              if (!date) return <div key={idx} className="h-9" />
              const key = toDayKey(date)
              const isStudy = studyDayKeys.has(key)
              const isToday = key === todayKey
              const cellClass = isStudy
                ? "bg-goukaku-pink-script/85 text-white font-bold"
                : isToday
                ? "border border-dashed border-goukaku-ink/40"
                : ""
              const content = (
                <div
                  className={`h-9 rounded-full flex items-center justify-center text-[12px] ${cellClass}`}
                >
                  {date.getDate()}
                </div>
              )
              return isStudy ? (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectDay(key)}
                  aria-label={`${date.getMonth() + 1}月${date.getDate()}日 の間違えた問題`}
                >
                  {content}
                </button>
              ) : (
                <div key={idx}>{content}</div>
              )
            })}
          </div>
        </div>

        <p className="text-[11px] opacity-55 text-center">
          1 問でも回答した日が記録されます。アクセスのみでは記録されません。
        </p>
      </div>
    </div>
  )
}

function PillStat({ icon, value, unit }: { icon: string; value: number; unit: string }) {
  return (
    <div className="bg-goukaku-surface rounded-2xl border border-goukaku-divider p-3 flex items-center gap-2">
      <span className="text-[15px]">{icon}</span>
      <span className="text-[18px] font-extrabold tabular-nums">{value}</span>
      <span className="text-[11px] opacity-60">{unit}</span>
    </div>
  )
}

function WrongList({
  dayKey,
  rows,
  loading,
  error,
  onBack,
  onJump,
}: {
  dayKey: string
  rows: WrongRow[]
  loading: boolean
  error: string | null
  onBack: () => void
  onJump: () => void
}) {
  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="flex items-start gap-3 p-5 border-b border-goukaku-divider">
        <button
          type="button"
          onClick={onBack}
          aria-label="戻る"
          className="w-8 h-8 rounded-full bg-goukaku-surface border border-goukaku-divider text-[14px] flex items-center justify-center"
        >
          ‹
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[18px] font-extrabold">{formatDay(dayKey)}</div>
          <div className="text-[11px] opacity-55 mt-0.5">間違えた問題</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="text-center text-[12px] opacity-60 py-10">読み込み中...</div>
        ) : error ? (
          <div className="text-center text-[13px] opacity-70 py-10">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-[28px] mb-1">✅</div>
            <div className="text-[14px] font-bold">この日は間違いゼロ</div>
            <div className="text-[11px] opacity-55 mt-1">正解した問題のみ</div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((r) => (
              <li key={r.questionId}>
                <a
                  href={`/fe/play/${r.examId}/q/${r.qNumber}`}
                  onClick={onJump}
                  className="block p-3 bg-goukaku-surface rounded-xl border border-goukaku-divider"
                >
                  <div className="text-[10px] tracking-wider font-bold opacity-55 uppercase">
                    {r.examId} · Q{r.qNumber}
                  </div>
                  <div className="text-[13px] font-semibold mt-1 line-clamp-2">{r.bodyPreview}</div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function toDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatDay(key: string): string {
  const [y, m, d] = key.split("-")
  return `${y}年 ${Number(m)}月 ${Number(d)}日`
}

function computeStreak(keys: Set<string>, today: Date): number {
  const todayKey = toDayKey(today)
  let cursor = new Date(today)
  if (!keys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1)
    if (!keys.has(toDayKey(cursor))) return 0
  }
  let streak = 0
  while (keys.has(toDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
