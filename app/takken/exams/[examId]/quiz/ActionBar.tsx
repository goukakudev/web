"use client";

import { useEffect, useState } from "react";
import {
  deriveTkHint,
  getTkVote,
  postTkReport,
  postTkVote,
  toggleTkVote,
} from "@/lib/takken/feedback";
import { getTkDeviceId } from "@/lib/takken/device";
import type { TakkenExplanation } from "@/lib/takken/api";

type VoteValue = "good" | "bad";
type Sheet = "hint" | "report" | null;

export function ActionBar({
  questionId,
  examId,
}: {
  questionId: string;
  examId: string;
}) {
  const [vote, setVote] = useState<VoteValue | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);

  useEffect(() => {
    queueMicrotask(() => setVote(getTkVote(questionId)));
  }, [questionId]);

  const handleVote = (pressed: VoteValue) => {
    const next = toggleTkVote(questionId, pressed);
    setVote(next);
    postTkVote({
      questionId,
      examId,
      deviceId: getTkDeviceId(),
      rating: next,
    });
  };

  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      <ActionButton
        kind={vote === "good" ? "good" : "default"}
        icon={<ThumbUpIcon />}
        label="Good"
        badge={vote === "good" ? "+1" : null}
        onClick={() => handleVote("good")}
      />
      <ActionButton
        kind={vote === "bad" ? "bad" : "default"}
        icon={<ThumbDownIcon />}
        label="Bad"
        badge={vote === "bad" ? "+1" : null}
        onClick={() => handleVote("bad")}
      />
      <ActionButton
        kind="default"
        icon={<FlagIcon />}
        label="問題を報告"
        onClick={() => setSheet("report")}
      />

      {sheet === "report" && (
        <ReportModal
          questionId={questionId}
          examId={examId}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

/**
 * 常時表示用 Hint ボタン (選択肢下に配置)。
 */
export function HintButton({
  questionId,
  explanation,
}: {
  questionId: string;
  explanation: TakkenExplanation | null | undefined;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-tk-gold-line bg-tk-gold-soft/60 px-3.5 py-1.5 text-[12px] font-medium text-tk-gold transition hover:bg-tk-gold-soft hover:text-tk-charcoal active:scale-[0.98]"
      >
        <HintIcon />
        <span>Hint</span>
      </button>
      {open && (
        <HintPopup
          questionId={questionId}
          hint={deriveTkHint(explanation)}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ActionButton({
  kind,
  icon,
  label,
  badge,
  onClick,
}: {
  kind: "default" | "good" | "bad";
  icon: React.ReactNode;
  label: string;
  badge?: string | null;
  onClick: () => void;
}) {
  const base =
    "relative inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[12px] font-medium transition active:scale-[0.97]";
  const palette =
    kind === "good"
      ? "border-tk-gold-line bg-tk-gold-soft text-tk-charcoal"
      : kind === "bad"
      ? "border-tk-crimson-line bg-tk-crimson-soft text-tk-crimson"
      : "border-tk-line bg-tk-card text-tk-ink-2 hover:bg-tk-canvas hover:text-tk-ink";
  return (
    <button type="button" onClick={onClick} className={`${base} ${palette}`}>
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="ml-0.5 rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

function HintPopup({
  questionId,
  hint,
  onClose,
}: {
  questionId: string;
  hint: string | null;
  onClose: () => void;
}) {
  useSheetEffects(onClose);
  return (
    <SheetShell label="ヒント" onClose={onClose}>
      <div className="border-b border-tk-line px-5 py-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-tk-ink-3">
          ヒント
        </div>
        <div className="mt-1 text-[10px] tracking-widest text-tk-ink-3">
          {questionId}
        </div>
      </div>
      <div className="px-5 py-6">
        {hint ? (
          <p className="font-mincho text-lg leading-relaxed text-tk-ink">
            {hint}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-tk-ink-3">
            この問題のヒントは準備中です。
          </p>
        )}
      </div>
    </SheetShell>
  );
}

function ReportModal({
  questionId,
  examId,
  onClose,
}: {
  questionId: string;
  examId: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | "ok" | "err">(null);
  useSheetEffects(onClose);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    const result = await postTkReport({
      questionId,
      examId,
      deviceId: getTkDeviceId(),
      message: trimmed,
    });
    setSubmitting(false);
    setDone(result.ok ? "ok" : "err");
    if (result.ok) {
      setTimeout(onClose, 900);
    }
  };

  return (
    <SheetShell label={`問題を報告 ${questionId}`} onClose={onClose}>
      <div className="border-b border-tk-line px-5 py-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-tk-ink-3">
          問題を報告
        </div>
        <div className="mt-1 font-mincho text-sm font-medium text-tk-ink">
          内容の誤り・誤字・改善案などをお知らせください
        </div>
        <div className="mt-1 text-[10px] tracking-widest text-tk-ink-3">
          {questionId}
        </div>
      </div>
      <div className="space-y-3 px-5 py-4">
        <textarea
          autoFocus
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="例: 選択肢2の「○○」は「××」の誤りです / 解説の根拠条文が違うように見えます"
          rows={6}
          className="w-full resize-y rounded-xl border border-tk-line bg-tk-bg px-3 py-2.5 text-[14px] leading-relaxed text-tk-ink outline-none focus:border-tk-gold"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-tk-ink-3">
            {message.length} / 1000
          </span>
          {done === "ok" && (
            <span className="text-[12px] text-tk-gold">送信しました</span>
          )}
          {done === "err" && (
            <span className="text-[12px] text-tk-crimson">
              送信に失敗しました
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-tk-line bg-tk-card px-4 py-3 text-[13px] font-medium text-tk-ink-2 hover:bg-tk-canvas"
          >
            キャンセル
          </button>
          <button
            type="button"
            disabled={!message.trim() || submitting || done === "ok"}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-tk-gold px-4 py-3 text-[13px] font-medium tracking-wider text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? "送信中…" : "送信"}
          </button>
        </div>
      </div>
    </SheetShell>
  );
}

function SheetShell({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className="absolute inset-0 bg-tk-charcoal/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-tk-card text-tk-ink shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-tk-ink-3 transition hover:bg-tk-canvas hover:text-tk-ink"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function useSheetEffects(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
}

function HintIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7C9 16 9.5 17 9.5 18h5c0-1 .5-2 1.5-3.3A7 7 0 0 0 12 2Z" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10v12M15 5.88 14 10h5.83A2 2 0 0 1 21.83 12.45l-2 7A2 2 0 0 1 17.83 21H7" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 14V2M9 18.12 10 14H4.17A2 2 0 0 1 2.17 11.55l2-7A2 2 0 0 1 6.17 3H17" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
    </svg>
  );
}
