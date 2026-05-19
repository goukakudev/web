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
  const [isHintRevealed, setIsHintRevealed] = useState(false);

  useEffect(() => {
    if (mode === "exam" && examStartedAt === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- start exam timer after hydration
      setExamStartedAt(Date.now());
    }
  }, [mode, examStartedAt]);

  useEffect(() => {
    setIsHintRevealed(false);
  }, [currentIndex]);

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
      {current.hint && current.hint.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          <button
            type="button"
            onClick={() => setIsHintRevealed((v) => !v)}
            aria-label={isHintRevealed ? "ヒントを閉じる" : "ヒントを表示"}
            className={
              isHintRevealed
                ? "self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-extrabold text-[10px] tracking-wider bg-goukaku-lime/50 text-goukaku-ink-fixed"
                : "self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-extrabold text-[10px] tracking-wider border border-goukaku-divider text-goukaku-ink/55"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isHintRevealed ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              className="w-3 h-3"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
              />
            </svg>
            <span>{isHintRevealed ? "ヒントを閉じる" : "ヒント"}</span>
          </button>
          {isHintRevealed && (
            <div
              className="flex gap-2.5 items-start px-3.5 py-3 rounded-2xl bg-goukaku-warm border border-goukaku-divider"
              role="note"
              aria-label={`ヒント、${current.hint}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-3.5 h-3.5 mt-0.5 shrink-0 text-goukaku-ink/75"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                />
              </svg>
              <p className="font-semibold text-[13px] text-goukaku-ink leading-snug">
                {current.hint}
              </p>
            </div>
          )}
        </div>
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
          className={
            isExamMode && currentIndex >= questions.length - 1
              ? "flex-1 py-3 rounded-full font-extrabold text-[13px] bg-goukaku-ink-fixed text-goukaku-lime"
              : "flex-1 py-3 rounded-full font-extrabold text-[13px] bg-goukaku-surface border border-goukaku-divider"
          }
        >
          {isExamMode && currentIndex >= questions.length - 1
            ? "採点する"
            : "次へ →"}
        </button>
      </div>
    </>
  );
}
