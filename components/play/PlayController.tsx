"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChoiceRow } from "./ChoiceRow";
import { QuestionBody } from "./QuestionBody";
import { PlayTopBar } from "./TopBar";
import { ExplanationCard } from "./ExplanationCard";
import { ExamTimer } from "./ExamTimer";
import { ExamResult } from "./ExamResult";
import { FeedbackSheet, type FeedbackRating } from "./FeedbackSheet";
import { GlossaryModal } from "./GlossaryModal";
import { CorrectRateBadge } from "./CorrectRateBadge";
import { SelectionMeter } from "./SelectionMeter";
import {
  AnswerFeedbackOverlay,
  type FeedbackKind,
} from "./AnswerFeedbackOverlay";
import type {
  Question,
  ChoiceLabel,
  ExamSummary,
  QuestionStat,
} from "@/lib/types";
import { setAnswer, getDeviceId, getAllAnswers } from "@/lib/local-store";
import { addExamSession } from "@/lib/exam-session";
import { recordAnswer } from "@/lib/client-api";
import { trackEvent } from "@/lib/client-events";
import { withShuffledChoicesAndMap } from "@/lib/question-display";
import {
  getGlossaryEntry,
  usedGlossaryTerms,
  type GlossaryEntry,
} from "@/lib/glossary";

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

function examDurationSeconds(examId: string): number {
  if (examId.startsWith("ap-")) return 150 * 60;
  if (examId.startsWith("ip-")) return 120 * 60;
  if (examId.startsWith("ee2-")) return 120 * 60;
  if (examId.startsWith("sc-")) return 40 * 60;
  return 90 * 60;
}

function nowMs(): number {
  return new Date().getTime();
}

function subjectFromUrlBase(urlBase: string): "fe" | "ip" | "ap" | "sg" | "sc" | "dk" {
  if (urlBase.startsWith("/ip")) return "ip";
  if (urlBase.startsWith("/ap")) return "ap";
  if (urlBase.startsWith("/sg")) return "sg";
  if (urlBase.startsWith("/sc")) return "sc";
  if (urlBase.startsWith("/denki")) return "dk";
  if (urlBase.startsWith("/dk")) return "dk";
  return "fe";
}

export function PlayController({
  questions: initialQuestions,
  exam,
  mode,
  initialQNumber,
  urlBase = "/fe/play",
  homeHref = "/fe",
  stats,
  variant = "default",
}: {
  questions: Question[];
  exam: ExamSummary;
  mode: Mode;
  initialQNumber?: number;
  urlBase?: string;
  homeHref?: string;
  stats?: Record<string, QuestionStat>;
  variant?: "default" | "denki";
}) {
  const router = useRouter();
  const subject = subjectFromUrlBase(urlBase);
  const [questions, setQuestions] = useState<Question[]>(() =>
    sortBySequence(initialQuestions),
  );
  // questionId → (displayed label → original label) のマップ。
  // stats を表示ラベル空間へ remap する際に使う。
  const [shuffleMaps, setShuffleMaps] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    let cancelled = false;
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
    const shuffled = next.map(withShuffledChoicesAndMap);
    const maps: Record<string, Record<string, string>> = {};
    for (const r of shuffled) {
      maps[r.question._id] = r.displayedToOriginal;
    }
    queueMicrotask(() => {
      if (cancelled) return;
      setQuestions(shuffled.map((r) => r.question));
      setShuffleMaps(maps);
    });
    return () => {
      cancelled = true;
    };
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
  const [feedbackSheet, setFeedbackSheet] = useState<{
    open: boolean;
    initialRating: FeedbackRating | null;
  }>({ open: false, initialRating: null });
  const [glossaryEntry, setGlossaryEntry] = useState<GlossaryEntry | null>(null);
  const [feedback, setFeedback] = useState<{
    trigger: number;
    kind: FeedbackKind | null;
  }>({ trigger: 0, kind: null });

  const handleGlossaryClick = (term: string) => {
    const entry = getGlossaryEntry(term);
    if (entry) setGlossaryEntry(entry);
  };

  useEffect(() => {
    if (mode === "exam" && examStartedAt === null) {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setExamStartedAt(nowMs());
      });
      return () => {
        cancelled = true;
      };
    }
  }, [mode, examStartedAt]);

  useEffect(() => {
    queueMicrotask(() => {
      setIsHintRevealed(false);
      setFeedbackSheet({ open: false, initialRating: null });
    });
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
    const finishedAt = nowMs();
    const elapsed = Math.floor((finishedAt - examStartedAt) / 1000);
    addExamSession({
      id: crypto.randomUUID(),
      exam_id: exam.exam_id,
      finished_at: new Date(finishedAt).toISOString(),
      elapsed_seconds: elapsed,
      correct: examCorrect,
      answered: examAnswered,
    });
    trackEvent("mock_complete", {
      subject,
      exam_id: exam.exam_id,
      correct: examCorrect,
      answered: examAnswered,
      total: questions.length,
      elapsed_seconds: elapsed,
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
          homeHref={homeHref}
          variant={variant}
        />
        <ExamResult
          correct={examCorrect}
          total={questions.length}
          elapsedSeconds={elapsed}
          variant={variant}
          onRetry={() => {
            setSelectedByQid({});
            setCurrentIndex(0);
            setExamFinished(false);
            setExamFinishedAt(null);
            setExamStartedAt(nowMs());
          }}
        />
      </>
    );
  }

  if (!current) return null;

  const selected = selectedByQid[current._id];
  const revealed = selected !== undefined && !isExamMode;
  const showsStats = !isExamMode;
  const isRandomMode = mode === "random";
  const topBarDisplayQNumber = isRandomMode
    ? currentIndex + 1
    : current.q_number;
  const topBarProgressText = isRandomMode
    ? `/ ${questions.length}`
    : `${currentIndex + 1} / ${questions.length}`;
  const topBarSourceLabel = isRandomMode
    ? `出典: ${current.exam_id} 問${current.q_number}`
    : undefined;

  function handleSelect(label: ChoiceLabel) {
    if (selected !== undefined && !isExamMode) return;
    setSelectedByQid((prev) => ({ ...prev, [current._id]: label }));

    if (!isExamMode && current.correct_label !== undefined) {
      const kind: FeedbackKind =
        label === current.correct_label ? "correct" : "wrong";
      setFeedback((prev) => ({ trigger: prev.trigger + 1, kind }));
      trackEvent("explanation_open", {
        subject,
        exam_id: current.exam_id,
        question_id: current._id,
        q_number: current.q_number,
      });
    }

    const answeredAt = new Date().toISOString();
    setAnswer({
      question_id: current._id,
      exam_id: current.exam_id,
      selected_label: label,
      correct_label: current.correct_label,
      answered_at: answeredAt,
    });

    // サーバ集計は DB 固定 label (シャッフル前) ベース。表示ラベルを
    // shuffleMaps で元 label に逆変換してから送る。
    const shuffleMap = shuffleMaps[current._id];
    const originalSelected = shuffleMap?.[label] ?? label;
    const originalCorrect = current.correct_label
      ? shuffleMap?.[current.correct_label] ?? current.correct_label
      : null;

    void recordAnswer({
      device_id: getDeviceId(),
      question_id: current._id,
      exam_id: current.exam_id,
      selected_label: originalSelected,
      correct_label: originalCorrect,
      is_correct: current.correct_label === label,
      skipped: false,
      client_ts: answeredAt,
      label_space: "original",
    });
    trackEvent("question_answer_submit", {
      subject,
      exam_id: current.exam_id,
      question_id: current._id,
      q_number: current.q_number,
      selected_label: originalSelected,
      is_correct: current.correct_label === label,
      mode,
    });

    if (isExamMode && currentIndex < questions.length - 1) {
      setTimeout(
        () => {
          setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
          scrollToTop();
        },
        200,
      );
    }
  }

  function scrollToTop(): void {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }

  function syncUrl(newIndex: number): void {
    if (mode !== "sequential") return;
    const q = questions[newIndex];
    if (!q) return;
    router.replace(`${urlBase}/${exam.exam_id}/q/${q.q_number}`, { scroll: false });
  }

  function next() {
    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      syncUrl(newIndex);
      scrollToTop();
    } else if (isExamMode) {
      finishExam();
    }
  }
  function prev() {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      syncUrl(newIndex);
      scrollToTop();
    }
  }

  return (
    <>
      <PlayTopBar
        examTitle={exam.title ?? exam.exam_id}
        qNumber={current.q_number}
        currentIndex={currentIndex}
        total={questions.length}
        questionId={current._id}
        homeHref={homeHref}
        displayQNumber={topBarDisplayQNumber}
        progressText={topBarProgressText}
        sourceLabel={topBarSourceLabel}
        variant={variant}
      />
      {isExamMode && examStartedAt !== null && (
        <div className="flex items-center justify-end mb-3">
          <ExamTimer
            startedAt={examStartedAt}
            onTimeout={finishExam}
            durationSeconds={examDurationSeconds(exam.exam_id)}
            variant={variant}
          />
        </div>
      )}
      <QuestionBody
        body={current.body}
        figures={current.figures}
        onGlossaryClick={handleGlossaryClick}
        variant={variant}
      />
      {current.choices.map((c) => {
        const isSelected = selected === c.label;
        const isCorrect = revealed
          ? c.label === current.correct_label
          : undefined;
        const stat = stats?.[current._id];
        const showMeter = showsStats && revealed && stat !== undefined;
        // stats.by_label は DB のシャッフル前ラベルで keyed。表示ラベル c.label を
        // shuffleMaps で原ラベルに変換してから lookup する。マップが無ければ identity。
        const originalLabel =
          shuffleMaps[current._id]?.[c.label] ?? c.label;
        const rate = stat && stat.total > 0
          ? ((stat.by_label[originalLabel] ?? 0) / stat.total) * 100
          : 0;
        return (
          <div key={c.label}>
            <ChoiceRow
              letter={c.label}
              text={c.text}
              isSelected={isSelected}
              isCorrect={isCorrect}
              onClick={() => handleSelect(c.label)}
              variant={variant}
            />
            {showMeter && (
              <SelectionMeter
                rate={rate}
                isCorrect={c.label === current.correct_label}
                revealed={revealed}
                variant={variant}
              />
            )}
          </div>
        );
      })}
      {showsStats && stats?.[current._id] && (
        <CorrectRateBadge stat={stats[current._id]!} variant={variant} />
      )}
      {revealed && current.explanation && (
        <ExplanationCard
          explanation={current.explanation}
          correctLabel={current.correct_label}
          tags={current.tags ?? []}
          priorGlossaryTerms={usedGlossaryTerms(current.body)}
          onGlossaryClick={handleGlossaryClick}
          subject={subjectFromUrlBase(urlBase)}
          variant={variant}
        />
      )}
      <GlossaryModal
        entry={glossaryEntry}
        onClose={() => setGlossaryEntry(null)}
      />
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex gap-2 items-center flex-wrap">
          <FeedbackChip
            label="Good"
            onClick={() =>
              setFeedbackSheet({ open: true, initialRating: "good" })
            }
            icon={<ThumbUpIcon />}
            variant={variant}
          />
          <FeedbackChip
            label="Bad"
            onClick={() =>
              setFeedbackSheet({ open: true, initialRating: "bad" })
            }
            icon={<ThumbDownIcon />}
            variant={variant}
          />
          {current.hint && current.hint.length > 0 && (
            <button
              type="button"
              onClick={() => setIsHintRevealed((v) => !v)}
              aria-label={isHintRevealed ? "ヒントを閉じる" : "ヒントを表示"}
              className={
                variant === "denki"
                  ? isHintRevealed
                    ? "inline-flex items-center gap-1.5 rounded-lg border border-[#191815] bg-[#ffe25a] px-3 py-2 text-[10px] font-black tracking-wider text-[#191815]"
                    : "inline-flex items-center gap-1.5 rounded-lg border border-[#191815]/20 bg-[#fffdf6] px-3 py-2 text-[10px] font-black tracking-wider text-[#6c6252]"
                  : isHintRevealed
                    ? "inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-extrabold text-[10px] tracking-wider bg-goukaku-lime/50 text-goukaku-ink-fixed"
                    : "inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-extrabold text-[10px] tracking-wider border border-goukaku-divider text-goukaku-ink/55"
              }
            >
              <LightbulbIcon filled={isHintRevealed} className="w-3 h-3" />
              <span>{isHintRevealed ? "ヒントを閉じる" : "ヒント"}</span>
            </button>
          )}
          <span className="flex-1" />
          <button
            type="button"
            onClick={() =>
              setFeedbackSheet({ open: true, initialRating: null })
            }
            aria-label="問題を報告"
            className={
              variant === "denki"
                ? "inline-flex items-center gap-1.5 rounded-lg border border-[#191815]/20 bg-[#fffdf6] px-3 py-2 text-[10px] font-black tracking-wider text-[#6c6252]"
                : "inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-extrabold text-[10px] tracking-wider border border-goukaku-divider text-goukaku-ink/55"
            }
          >
            <ReportIcon />
            <span>問題を報告</span>
          </button>
        </div>
        {isHintRevealed && current.hint && current.hint.length > 0 && (
          <div
            className={
              variant === "denki"
                ? "flex items-start gap-2.5 rounded-lg border-2 border-[#191815] bg-[#fff8cf] px-3.5 py-3 shadow-[3px_3px_0_#191815]"
                : "flex gap-2.5 items-start px-3.5 py-3 rounded-2xl bg-goukaku-warm border border-goukaku-divider"
            }
            role="note"
            aria-label={`ヒント、${current.hint}`}
          >
            <LightbulbIcon
              filled={false}
              className="w-3.5 h-3.5 mt-0.5 shrink-0 text-goukaku-ink/75"
            />
            <p className="font-semibold text-[13px] text-goukaku-ink leading-snug">
              {current.hint}
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-2.5 mt-4">
        <button
          type="button"
          onClick={prev}
          disabled={currentIndex === 0}
          className={
            variant === "denki"
              ? "flex-1 rounded-lg border border-[#191815]/20 bg-[#fffdf6] py-3 text-[13px] font-black disabled:opacity-40"
              : "flex-1 py-3 rounded-full font-extrabold text-[13px] bg-goukaku-surface border border-goukaku-divider disabled:opacity-40"
          }
        >
          ← 前へ
        </button>
        <button
          type="button"
          onClick={next}
          className={
            variant === "denki"
              ? isExamMode && currentIndex >= questions.length - 1
                ? "flex-1 rounded-lg border-2 border-[#191815] bg-[#ffe25a] py-3 text-[13px] font-black text-[#191815] shadow-[3px_3px_0_#191815]"
                : "flex-1 rounded-lg border border-[#191815]/20 bg-[#fffdf6] py-3 text-[13px] font-black"
              : isExamMode && currentIndex >= questions.length - 1
                ? "flex-1 py-3 rounded-full font-extrabold text-[13px] bg-goukaku-ink-fixed text-goukaku-lime"
                : "flex-1 py-3 rounded-full font-extrabold text-[13px] bg-goukaku-surface border border-goukaku-divider"
          }
        >
          {isExamMode && currentIndex >= questions.length - 1
            ? "採点する"
            : "次へ →"}
        </button>
      </div>
      {feedbackSheet.open && (
        <FeedbackSheet
          questionId={current._id}
          examId={current.exam_id}
          initialRating={feedbackSheet.initialRating}
          onClose={() =>
            setFeedbackSheet({ open: false, initialRating: null })
          }
        />
      )}
      <AnswerFeedbackOverlay trigger={feedback.trigger} kind={feedback.kind} />
    </>
  );
}

function FeedbackChip({
  label,
  onClick,
  icon,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  variant?: "default" | "denki";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === "denki"
          ? "inline-flex items-center gap-1.5 rounded-lg border border-[#191815]/20 bg-[#fffdf6] px-3 py-2 text-[10px] font-black tracking-wider text-[#6c6252]"
          : "inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-extrabold text-[10px] tracking-wider border border-goukaku-divider text-goukaku-ink/55"
      }
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ThumbUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3 h-3"
      aria-hidden
    >
      <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 17.25 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.977a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3 h-3"
      aria-hidden
    >
      <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 0-.322 1.672V21a.75.75 0 0 1-.75.75 2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12c0-2.848.992-5.464 2.649-7.521C4.537 3.997 5.136 3.75 5.754 3.75h4.146c.483 0 .964.078 1.423.23l3.114 1.04c.46.153.94.231 1.423.231h.045c.36-.59.79-1.111 1.276-1.55ZM21.669 13.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z" />
    </svg>
  );
}

function LightbulbIcon({
  filled,
  className,
}: {
  filled: boolean;
  className: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-3 h-3"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
      />
    </svg>
  );
}
