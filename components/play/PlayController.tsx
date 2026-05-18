"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChoiceRow } from "./ChoiceRow";
import { QuestionBody } from "./QuestionBody";
import { PlayTopBar } from "./TopBar";
import { ExplanationCard } from "./ExplanationCard";
import { ExamTimer } from "./ExamTimer";
import { ExamResult } from "./ExamResult";
import type { Question, ChoiceLabel, ExamSummary } from "@/lib/types";
import { setAnswer, getDeviceId, getAllAnswers } from "@/lib/local-store";
import { addExamSession } from "@/lib/exam-session";
import { recordAnswer } from "@/lib/client-api";

type Mode = "sequential" | "random" | "wrongOnly" | "exam";

function sortBySequence(qs: Question[]): Question[] {
  return [...qs].sort((a, b) => a.q_number - b.q_number);
}

function shuffle(qs: Question[]): Question[] {
  const out = [...qs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function PlayController({
  questions: initialQuestions,
  exam,
  mode,
  initialQNumber,
}: {
  questions: Question[];
  exam: ExamSummary;
  mode: Mode;
  initialQNumber?: number;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(() =>
    sortBySequence(initialQuestions),
  );

  useEffect(() => {
    let next: Question[];
    if (mode === "random") {
      next = shuffle(initialQuestions);
    } else if (mode === "wrongOnly") {
      const all = getAllAnswers();
      const wrongIds = new Set(
        Object.values(all)
          .filter(
            (rec) =>
              rec.correct_label !== undefined &&
              rec.selected_label !== rec.correct_label,
          )
          .map((rec) => rec.question_id),
      );
      next = sortBySequence(initialQuestions.filter((q) => wrongIds.has(q._id)));
    } else {
      next = sortBySequence(initialQuestions);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mode-dependent filter runs after hydration
    setQuestions(next);
  }, [initialQuestions, mode]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialQNumber === undefined) return 0;
    const sorted = sortBySequence(initialQuestions);
    const idx = sorted.findIndex((q) => q.q_number === initialQNumber);
    return idx >= 0 ? idx : 0;
  });
  const [selectedByQid, setSelectedByQid] = useState<
    Record<string, ChoiceLabel>
  >({});
  const [examStartedAt, setExamStartedAt] = useState<number | null>(null);
  const [examFinished, setExamFinished] = useState(false);
  const [examFinishedAt, setExamFinishedAt] = useState<number | null>(null);

  useEffect(() => {
    if (mode === "exam" && examStartedAt === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- start exam timer after hydration
      setExamStartedAt(Date.now());
    }
  }, [mode, examStartedAt]);

  const isExamMode = mode === "exam";
  const current = questions[currentIndex];

  const examCorrect = useMemo(() => {
    if (!isExamMode) return 0;
    let n = 0;
    for (const q of questions) {
      const sel = selectedByQid[q._id];
      if (sel !== undefined && q.correct_label === sel) n++;
    }
    return n;
  }, [isExamMode, questions, selectedByQid]);

  const examAnswered = useMemo(() => {
    if (!isExamMode) return 0;
    return questions.filter((q) => selectedByQid[q._id] !== undefined).length;
  }, [isExamMode, questions, selectedByQid]);

  function finishExam(): void {
    if (!isExamMode || examStartedAt === null) return;
    const finishedAt = Date.now();
    const elapsed = Math.floor((finishedAt - examStartedAt) / 1000);
    addExamSession({
      id: crypto.randomUUID(),
      exam_id: exam.exam_id,
      finished_at: new Date(finishedAt).toISOString(),
      elapsed_seconds: elapsed,
      correct: examCorrect,
      answered: examAnswered,
    });
    setExamFinishedAt(finishedAt);
    setExamFinished(true);
  }

  if (!current && !examFinished) {
    return (
      <p className="text-center mt-10 text-goukaku-ink/55 text-[13px]">
        {mode === "wrongOnly"
          ? "間違えた問題はまだありません"
          : "問題がありません"}
      </p>
    );
  }

  if (
    isExamMode &&
    examFinished &&
    examStartedAt !== null &&
    examFinishedAt !== null
  ) {
    const elapsed = Math.floor((examFinishedAt - examStartedAt) / 1000);
    return (
      <>
        <PlayTopBar
          examTitle={exam.title ?? exam.exam_id}
          qNumber={0}
          currentIndex={0}
          total={questions.length}
        />
        <ExamResult
          correct={examCorrect}
          total={questions.length}
          elapsedSeconds={elapsed}
          onRetry={() => {
            setSelectedByQid({});
            setCurrentIndex(0);
            setExamFinished(false);
            setExamFinishedAt(null);
            setExamStartedAt(Date.now());
          }}
        />
      </>
    );
  }

  if (!current) return null;

  const selected = selectedByQid[current._id];
  const revealed = selected !== undefined && !isExamMode;

  function handleSelect(label: ChoiceLabel) {
    if (selected !== undefined && !isExamMode) return;
    setSelectedByQid((prev) => ({ ...prev, [current._id]: label }));

    const answeredAt = new Date().toISOString();
    setAnswer({
      question_id: current._id,
      exam_id: current.exam_id,
      selected_label: label,
      correct_label: current.correct_label,
      answered_at: answeredAt,
    });

    void recordAnswer({
      device_id: getDeviceId(),
      question_id: current._id,
      exam_id: current.exam_id,
      selected_label: label,
      correct_label: current.correct_label ?? null,
      is_correct: current.correct_label === label,
      skipped: false,
      client_ts: answeredAt,
    });

    if (isExamMode && currentIndex < questions.length - 1) {
      setTimeout(
        () =>
          setCurrentIndex((i) => Math.min(i + 1, questions.length - 1)),
        200,
      );
    }
  }

  function syncUrl(newIndex: number): void {
    if (mode !== "sequential") return;
    const q = questions[newIndex];
    if (!q) return;
    router.replace(`/play/${exam.exam_id}/q/${q.q_number}`, { scroll: false });
  }

  function next() {
    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      syncUrl(newIndex);
    } else if (isExamMode) {
      finishExam();
    }
  }
  function prev() {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      syncUrl(newIndex);
    }
  }

  return (
    <>
      <PlayTopBar
        examTitle={exam.title ?? exam.exam_id}
        qNumber={current.q_number}
        currentIndex={currentIndex}
        total={questions.length}
      />
      {isExamMode && examStartedAt !== null && (
        <div className="flex items-center justify-end mb-3">
          <ExamTimer startedAt={examStartedAt} onTimeout={finishExam} />
        </div>
      )}
      <QuestionBody body={current.body} figures={current.figures} />
      {current.choices.map((c) => {
        const isSelected = selected === c.label;
        const isCorrect = revealed
          ? c.label === current.correct_label
          : undefined;
        return (
          <ChoiceRow
            key={c.label}
            letter={c.label}
            text={c.text}
            isSelected={isSelected}
            isCorrect={isCorrect}
            onClick={() => handleSelect(c.label)}
          />
        );
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
          className="flex-1 py-3 rounded-full font-extrabold text-[13px] bg-goukaku-ink text-goukaku-lime"
        >
          {isExamMode && currentIndex >= questions.length - 1
            ? "採点する"
            : "次へ →"}
        </button>
      </div>
    </>
  );
}
