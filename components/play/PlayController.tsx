"use client"

import { useState, useEffect } from "react"
import { ChoiceRow } from "./ChoiceRow"
import { QuestionBody } from "./QuestionBody"
import { PlayTopBar } from "./TopBar"
import type { Question, ChoiceLabel, ExamSummary } from "@/lib/types"
import { setAnswer } from "@/lib/local-store"

type Mode = "sequential" | "random"

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
  // Initial render uses deterministic sort to avoid hydration mismatch.
  // If mode === "random", the shuffle runs in an effect after mount.
  const [questions, setQuestions] = useState<Question[]>(() => sortBySequence(initialQuestions))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffle must run after hydration to keep SSR deterministic
    setQuestions(mode === "random" ? shuffle(initialQuestions) : sortBySequence(initialQuestions))
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
