"use client"

import { useState, useMemo } from "react"
import { ChoiceRow } from "./ChoiceRow"
import { QuestionBody } from "./QuestionBody"
import { PlayTopBar } from "./TopBar"
import type { Question, ChoiceLabel, ExamSummary } from "@/lib/types"
import { setAnswer } from "@/lib/local-store"

type Mode = "sequential" | "random"

export function PlayController({
  questions: initialQuestions,
  exam,
  mode,
}: {
  questions: Question[]
  exam: ExamSummary
  mode: Mode
}) {
  const questions = useMemo(() => {
    if (mode === "random") {
      return [...initialQuestions].sort(() => Math.random() - 0.5)
    }
    return [...initialQuestions].sort((a, b) => a.q_number - b.q_number)
  }, [initialQuestions, mode])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedByQid, setSelectedByQid] = useState<Record<string, ChoiceLabel>>({})

  const current = questions[currentIndex]
  if (!current) {
    return <p className="text-center mt-10">問題がありません</p>
  }

  const selected = selectedByQid[current._id]
  const revealed = selected !== undefined

  function handleSelect(label: ChoiceLabel) {
    if (revealed) return
    setSelectedByQid((prev) => ({ ...prev, [current._id]: label }))
    setAnswer({
      question_id: current._id,
      exam_id: current.exam_id,
      selected_label: label,
      correct_label: current.correct_label,
      answered_at: new Date().toISOString(),
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
