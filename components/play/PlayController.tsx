"use client"

import { useState, useEffect } from "react"
import { ChoiceRow } from "./ChoiceRow"
import { QuestionBody } from "./QuestionBody"
import { PlayTopBar } from "./TopBar"
import { ExplanationCard } from "./ExplanationCard"
import type { Question, ChoiceLabel, ExamSummary } from "@/lib/types"
import { setAnswer, getDeviceId, getAllAnswers } from "@/lib/local-store"
import { recordAnswer } from "@/lib/client-api"

type Mode = "sequential" | "random" | "wrongOnly" | "exam"

function sortBySequence(qs: Question[]): Question[] {
  return [...qs].sort((a, b) => a.q_number - b.q_number)
}

function shuffle(qs: Question[]): Question[] {
  const out = [...qs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function PlayController({
  questions: initialQuestions,
  exam,
  mode,
}: {
  questions: Question[]
  exam: ExamSummary
  mode: Mode
}) {
  const [questions, setQuestions] = useState<Question[]>(() => sortBySequence(initialQuestions))

  useEffect(() => {
    let next: Question[]
    if (mode === "random") {
      next = shuffle(initialQuestions)
    } else if (mode === "wrongOnly") {
      const all = getAllAnswers()
      const wrongIds = new Set(
        Object.values(all)
          .filter((rec) => rec.correct_label !== undefined && rec.selected_label !== rec.correct_label)
          .map((rec) => rec.question_id),
      )
      next = sortBySequence(initialQuestions.filter((q) => wrongIds.has(q._id)))
    } else {
      next = sortBySequence(initialQuestions)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mode-dependent filter runs after hydration
    setQuestions(next)
  }, [initialQuestions, mode])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedByQid, setSelectedByQid] = useState<Record<string, ChoiceLabel>>({})

  const current = questions[currentIndex]
  if (!current) {
    return (
      <p className="text-center mt-10 text-goukaku-ink/55 text-[13px]">
        {mode === "wrongOnly" ? "間違えた問題はまだありません" : "問題がありません"}
      </p>
    )
  }

  const selected = selectedByQid[current._id]
  const revealed = selected !== undefined

  function handleSelect(label: ChoiceLabel) {
    if (revealed) return
    setSelectedByQid((prev) => ({ ...prev, [current._id]: label }))

    const answeredAt = new Date().toISOString()
    setAnswer({
      question_id: current._id,
      exam_id: current.exam_id,
      selected_label: label,
      correct_label: current.correct_label,
      answered_at: answeredAt,
    })

    void recordAnswer({
      device_id: getDeviceId(),
      question_id: current._id,
      exam_id: current.exam_id,
      selected_label: label,
      correct_label: current.correct_label ?? null,
      is_correct: current.correct_label === label,
      skipped: false,
      client_ts: answeredAt,
    })
  }

  function next() {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1)
  }
  function prev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  return (
    <>
      <PlayTopBar
        examTitle={exam.title ?? exam.exam_id}
        qNumber={current.q_number}
        currentIndex={currentIndex}
        total={questions.length}
      />
      <QuestionBody body={current.body} />
      {current.choices.map((c) => {
        const isSelected = selected === c.label
        const isCorrect =
          revealed ? c.label === current.correct_label : undefined
        return (
          <ChoiceRow
            key={c.label}
            letter={c.label}
            text={c.text}
            isSelected={isSelected}
            isCorrect={isCorrect}
            onClick={() => handleSelect(c.label)}
          />
        )
      })}
      {revealed && current.explanation && (
        <ExplanationCard
          explanation={current.explanation}
          correctLabel={current.correct_label}
          tags={current.tags ?? []}
        />
      )}
      <div className="flex gap-2.5 mt-4">
        <button
          type="button"
          onClick={prev}
          disabled={currentIndex === 0}
          className="flex-1 py-3 rounded-full font-extrabold text-[13px] bg-goukaku-surface border border-goukaku-divider disabled:opacity-40"
        >
          ← 前へ
        </button>
        <button
          type="button"
          onClick={next}
          disabled={currentIndex >= questions.length - 1}
          className="flex-1 py-3 rounded-full font-extrabold text-[13px] bg-goukaku-ink text-goukaku-lime disabled:opacity-40"
        >
          次へ →
        </button>
      </div>
    </>
  )
}
