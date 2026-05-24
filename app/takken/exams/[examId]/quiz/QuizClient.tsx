"use client";

import Link from "next/link";
import { useState, useMemo, useRef } from "react";
import type { TakkenQuestion } from "@/lib/takken/api";
import { recordTkLocalAttempt, postTkAttempt } from "@/lib/takken/device";
import { LawRefChip } from "./LawRefChip";
import { ActionBar, HintButton } from "./ActionBar";

type Mode = "instant" | "exam";

export default function QuizClient({
  examId,
  breadcrumb,
  questions,
  mode,
}: {
  examId: string;
  breadcrumb?: string;
  questions: TakkenQuestion[];
  mode: Mode;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`,
  );

  const current = questions[index];
  const isRevealed = revealed.has(index);

  if (finished) {
    return <ResultView examId={examId} questions={questions} answers={answers} onReplay={() => {
      setIndex(0);
      setAnswers({});
      setRevealed(new Set());
      setFinished(false);
    }} />;
  }

  if (!current) return null;

  const handleSelect = (n: number) => {
    if (mode === "instant" && isRevealed) return;
    setAnswers((prev) => ({ ...prev, [index]: n }));
    if (mode === "instant") {
      setRevealed((prev) => new Set(prev).add(index));
      const isCorrect = current.accepted_answers.includes(n);
      const targetExamId = current.exam_id ?? examId;
      recordTkLocalAttempt({
        questionId: current._id,
        examId: targetExamId,
        selectedAnswer: n,
        isCorrect,
        skipped: false,
        ts: Date.now(),
      });
      void postTkAttempt({
        questionId: current._id,
        examId: targetExamId,
        selectedAnswer: n,
        isCorrect,
        skipped: false,
        sessionId: sessionIdRef.current,
      });
    }
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      // exam モードで終了時、未送信の解答を一括送信
      if (mode === "exam") {
        questions.forEach((q, i) => {
          const sel = answers[i];
          if (sel === undefined) return;
          const isCorrect = q.accepted_answers.includes(sel);
          const targetExamId = q.exam_id ?? examId;
          recordTkLocalAttempt({
            questionId: q._id,
            examId: targetExamId,
            selectedAnswer: sel,
            isCorrect,
            skipped: false,
            ts: Date.now(),
          });
          void postTkAttempt({
            questionId: q._id,
            examId: targetExamId,
            selectedAnswer: sel,
            isCorrect,
            skipped: false,
            sessionId: sessionIdRef.current,
          });
        });
      }
      setFinished(true);
    }
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const choiceState = (k: string): ChoiceState => {
    const intK = parseInt(k, 10);
    const selected = answers[index];
    if (isRevealed) {
      const correct = current.accepted_answers.includes(intK);
      if (intK === selected && correct) return "correct-selected";
      if (intK === selected && !correct) return "wrong-selected";
      if (correct) return "correct-reveal";
      return "normal";
    }
    return selected === intK ? "selected" : "normal";
  };

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <main className="flex min-h-screen flex-col bg-bg">
      {/* Top bar */}
      <div className="flex items-center gap-3.5 px-5 pt-2">
        <Link
          href={`/takken/exams/${examId}`}
          className="flex h-9 w-9 items-center justify-center text-ink-2 hover:text-ink"
          aria-label="戻る"
        >
          ✕
        </Link>
        <p className="font-medium tracking-wider text-ink">
          {breadcrumb ?? `${index + 1}/${questions.length}問`}
        </p>
        <div className="flex-1" />
      </div>

      {/* Progress */}
      <div className="relative mx-5 mb-4 mt-2 h-[3px] overflow-hidden rounded-full bg-line">
        <div
          className="h-full bg-gold transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <span className="tag">{current.category}</span>

        <div className="mt-4 whitespace-pre-line font-mincho text-[17px] leading-[1.75] tracking-wide text-ink">
          {current.question_text.trim()}
        </div>

        {current.statements && current.statements.length > 0 && (
          <div className="mt-4 rounded-xl bg-canvas p-3.5">
            {current.statements.map((s) => (
              <div key={s.label} className="flex gap-2 py-1">
                <span className="w-6 font-mincho text-sm font-medium text-ink-2">
                  {s.label}
                </span>
                <span className="text-sm leading-relaxed text-ink">{s.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="my-5 h-px bg-line" />

        <div className="space-y-2.5">
          {Object.entries(current.choices)
            .sort()
            .map(([k, text]) => (
              <ChoiceRow
                key={k}
                num={parseInt(k, 10)}
                text={text}
                state={choiceState(k)}
                onClick={() => handleSelect(parseInt(k, 10))}
              />
            ))}
        </div>

        <div className="mt-3 flex justify-end">
          <HintButton questionId={current._id} explanation={current.explanation} />
        </div>

        {isRevealed && mode === "instant" && (
          <ExplanationBlock
            question={current}
            selected={answers[index] ?? null}
            examId={examId}
          />
        )}
      </div>

      {/* Action bar */}
      <div className="border-t border-line bg-bg px-6 py-3.5">
        {mode === "instant" && isRevealed ? (
          <button className="btn-primary w-full" onClick={handleNext}>
            {index + 1 < questions.length ? "次の問題へ" : "結果を見る"}
          </button>
        ) : mode === "instant" ? (
          <p className="py-4 text-center text-xs tracking-wide text-ink-3">
            選択肢をタップして解答
          </p>
        ) : (
          <div className="flex gap-2.5">
            <button
              className="btn-ghost w-16"
              onClick={handlePrev}
              disabled={index === 0}
              aria-label="前へ"
            >
              ‹
            </button>
            <button className="btn-primary flex-1" onClick={handleNext}>
              {index + 1 < questions.length ? "次の問題へ" : "採点する"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================================
// Choice
// ============================================================
type ChoiceState =
  | "normal"
  | "selected"
  | "correct-selected"
  | "wrong-selected"
  | "correct-reveal";

function ChoiceRow({
  num,
  text,
  state,
  onClick,
}: {
  num: number;
  text: string;
  state: ChoiceState;
  onClick: () => void;
}) {
  const numBg =
    state === "wrong-selected"
      ? "bg-crimson text-white"
      : state === "normal"
      ? "bg-option-bg text-ink-2"
      : "bg-gold text-white";
  const bg =
    state === "normal"
      ? "bg-bg"
      : state === "wrong-selected"
      ? "bg-crimson-soft"
      : "bg-gold-soft";
  const border =
    state === "normal"
      ? "border-line"
      : state === "wrong-selected"
      ? "border-crimson-line"
      : "border-gold-line";
  const indicator =
    state === "correct-selected" || state === "correct-reveal" ? (
      <span className="text-gold">✓</span>
    ) : state === "wrong-selected" ? (
      <span className="text-crimson">✕</span>
    ) : (
      <span className="opacity-0">·</span>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border ${bg} ${border} p-3.5 text-left transition`}
    >
      <span
        className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold ${numBg}`}
      >
        {num}
      </span>
      <span className="flex-1 text-[13px] leading-[1.65] tracking-wide text-ink">
        {text}
      </span>
      <span className="mt-1.5 w-4 text-center text-xs font-bold">{indicator}</span>
    </button>
  );
}

// ============================================================
// Explanation block
// ============================================================
function ExplanationBlock({
  question,
  selected,
  examId,
}: {
  question: TakkenQuestion;
  selected: number | null;
  examId: string;
}) {
  const exp = question.explanation;
  const isCorrect =
    selected !== null && question.accepted_answers.includes(selected);

  return (
    <div className="mt-5 rounded-2xl border border-gold-line/60 bg-card p-5">
      {/* Feedback */}
      <div className="flex items-center gap-2.5">
        <span className={`text-2xl ${isCorrect ? "text-gold" : "text-crimson"}`}>
          {isCorrect ? "✓" : "✕"}
        </span>
        <span className="font-mincho text-lg font-medium text-ink">
          {isCorrect ? "正解" : "不正解"}
        </span>
        <div className="flex-1" />
        {question.correct_answer && (
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-ink-3">正解</span>
            <span className="font-mincho text-base font-medium text-gold">
              {question.correct_answer}
            </span>
          </div>
        )}
      </div>

      {exp ? (
        <div className="mt-5 space-y-5">
          {exp.commentary && (
            <Section title="解説">
              <p className="whitespace-pre-line text-sm leading-[1.7] text-ink">
                {exp.commentary}
              </p>
            </Section>
          )}
          {exp.choice_explanations && (
            <Section title="選択肢別">
              <div className="space-y-3">
                {Object.keys(exp.choice_explanations)
                  .sort()
                  .map((k) => {
                    const text = exp.choice_explanations![k]!;
                    const mark = text.startsWith("○")
                      ? "○"
                      : text.startsWith("×")
                      ? "×"
                      : "";
                    const body = mark ? text.slice(1).trim() : text;
                    const markColor = mark === "○" ? "text-gold" : "text-crimson";
                    const intK = parseInt(k, 10);
                    const isCorrectChoice =
                      question.accepted_answers.includes(intK);
                    return (
                      <div key={k} className="flex gap-3">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            isCorrectChoice
                              ? "bg-gold-soft text-gold"
                              : "bg-option-bg text-ink-2"
                          }`}
                        >
                          {k}
                        </span>
                        <div className="flex-1">
                          {mark && (
                            <span className={`font-mincho text-base ${markColor}`}>
                              {mark}
                            </span>
                          )}
                          <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                            {body}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Section>
          )}
          {exp.key_law && exp.key_law.length > 0 && (
            <Section title="関連条文・判例">
              <div className="flex flex-wrap gap-2">
                {exp.key_law.map((law) => (
                  <LawRefChip key={law} text={law} />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-ink-3">
                タップで条文の内容を表示
              </p>
            </Section>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-3">この問題の解説は準備中です</p>
      )}

      <ActionBar questionId={question._id} examId={examId} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="block h-3.5 w-[3px] bg-gold" />
        <span className="font-mincho text-sm font-medium tracking-wide text-ink">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ============================================================
// Result view
// ============================================================
function ResultView({
  examId,
  questions,
  answers,
  onReplay,
}: {
  examId: string;
  questions: TakkenQuestion[];
  answers: Record<number, number>;
  onReplay: () => void;
}) {
  const stats = useMemo(() => {
    let correct = 0;
    const states = questions.map((q, i) => {
      const a = answers[i];
      if (a === undefined) return "un" as const;
      const ok = q.accepted_answers.includes(a);
      if (ok) correct++;
      return ok ? ("ok" as const) : ("ng" as const);
    });
    return { correct, total: questions.length, states };
  }, [questions, answers]);

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  const ringValue = accuracy / 100;
  const r = 88.5;
  const c = 2 * Math.PI * r;
  const dash = c * ringValue;

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/takken/exams/${examId}`}
          className="mb-8 inline-flex items-center text-xs tracking-widest text-ink-3 hover:text-ink-2"
        >
          ← 試験詳細へ
        </Link>

        <h1 className="text-center font-mincho text-sm tracking-widest text-ink-3">
          結果
        </h1>

        {/* Big ring */}
        <div className="relative mx-auto mt-6 h-[184px] w-[184px]">
          <svg width="184" height="184" className="-rotate-90">
            <circle cx="92" cy="92" r={r} fill="none" stroke="var(--color-canvas)" strokeWidth="7" />
            <circle
              cx="92"
              cy="92"
              r={r}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c - dash}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] tracking-widest text-ink-3">正解率</p>
            <p className="font-mincho text-5xl font-medium text-ink">
              {accuracy}
              <span className="text-2xl">%</span>
            </p>
            <p className="mt-1 text-[11px] tracking-wide text-ink-2">
              {stats.correct}/{stats.total}問正解
            </p>
          </div>
        </div>

        {/* Question grid */}
        <div className="mt-10">
          <h3 className="mb-2 text-sm font-semibold tracking-wider text-ink-2">
            問題別の結果
          </h3>
          <div className="grid grid-cols-10 gap-1 gap-y-1.5">
            {stats.states.map((s, i) => (
              <span
                key={i}
                className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-medium ${
                  s === "ok"
                    ? "bg-gold text-white"
                    : s === "ng"
                    ? "bg-[#ece6dd] text-ink-2"
                    : "border border-line bg-bg text-ink-2"
                }`}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-6 text-xs text-ink-2">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-gold" /> 正解
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ece6dd]" /> 不正解
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full border border-line bg-bg" /> 未解答
            </span>
          </div>
        </div>

        <div className="mt-8 flex gap-2.5">
          <Link
            href={`/takken/exams/${examId}`}
            className="btn-ghost flex-1"
          >
            試験詳細へ
          </Link>
          <button className="btn-primary flex-1" onClick={onReplay}>
            もう一度解く
          </button>
        </div>
      </div>
    </main>
  );
}
