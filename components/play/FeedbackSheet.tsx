"use client";

import { useEffect, useState } from "react";
import { submitFeedback } from "@/lib/client-api";
import { getDeviceId } from "@/lib/local-store";

export type FeedbackRating = "good" | "bad";

interface FeedbackSheetProps {
  questionId: string;
  examId: string;
  initialRating: FeedbackRating | null;
  onClose: () => void;
}

export function FeedbackSheet({
  questionId,
  examId,
  initialRating,
  onClose,
}: FeedbackSheetProps) {
  const [rating, setRating] = useState<FeedbackRating | null>(initialRating);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSubmit = rating !== null || comment.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmittedMessage(null);
    try {
      await submitFeedback({
        device_id: getDeviceId(),
        question_id: questionId,
        exam_id: examId,
        rating: rating,
        comment: comment.trim() ? comment.trim() : null,
        client_ts: new Date().toISOString(),
      });
      setSubmittedMessage("送信しました。ありがとうございます。");
      setRating(null);
      setComment("");
      setTimeout(onClose, 900);
    } catch {
      setErrorMessage("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label="この問題について"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-goukaku-bg rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between mb-1">
          <div>
            <h2 className="font-extrabold text-[22px] tracking-tight text-goukaku-pink-script">
              Feedback
            </h2>
            <p className="text-[12px] text-goukaku-ink/55 mt-1">
              この問題について教えてください
            </p>
            <p className="text-[10px] font-bold tracking-widest text-goukaku-ink/40 mt-1">
              {questionId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 rounded-full bg-goukaku-surface border border-goukaku-divider flex items-center justify-center font-extrabold text-goukaku-ink"
          >
            ×
          </button>
        </header>

        <div className="flex gap-3 mt-5">
          <RatingButton
            value="good"
            label="Good"
            current={rating}
            onClick={() => setRating((r) => (r === "good" ? null : "good"))}
          />
          <RatingButton
            value="bad"
            label="Bad"
            current={rating}
            onClick={() => setRating((r) => (r === "bad" ? null : "bad"))}
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="feedback-comment"
            className="block text-[12px] text-goukaku-ink/60 mb-1.5"
          >
            詳細（任意）
          </label>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="誤字・問題の不備・改善要望など"
            rows={6}
            className="w-full p-3 rounded-2xl bg-goukaku-surface border border-goukaku-divider text-goukaku-ink placeholder:text-goukaku-ink/35 focus:outline-none focus:ring-2 focus:ring-goukaku-lime/50 text-[14px] resize-none"
          />
        </div>

        {submittedMessage && (
          <p className="mt-3 text-[12px] text-goukaku-accent-purple">
            {submittedMessage}
          </p>
        )}
        {errorMessage && (
          <p className="mt-3 text-[12px] text-red-500">{errorMessage}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={
            "mt-5 w-full py-3.5 rounded-full font-extrabold text-[14px] tracking-widest text-goukaku-ink " +
            (canSubmit && !isSubmitting
              ? "bg-goukaku-lime"
              : "bg-goukaku-divider opacity-60")
          }
        >
          {isSubmitting ? "送信中..." : "送信"}
        </button>
      </div>
    </div>
  );
}

function RatingButton({
  value,
  label,
  current,
  onClick,
}: {
  value: FeedbackRating;
  label: string;
  current: FeedbackRating | null;
  onClick: () => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-extrabold text-[13px] tracking-wider " +
        (active
          ? "bg-goukaku-lime text-goukaku-ink border border-goukaku-ink"
          : "bg-goukaku-surface text-goukaku-ink/55 border border-goukaku-divider")
      }
      aria-pressed={active}
    >
      {value === "good" ? <ThumbUp /> : <ThumbDown />}
      <span>{label}</span>
    </button>
  );
}

function ThumbUp() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 17.25 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.977a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
    </svg>
  );
}

function ThumbDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 0-.322 1.672V21a.75.75 0 0 1-.75.75 2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12c0-2.848.992-5.464 2.649-7.521C4.537 3.997 5.136 3.75 5.754 3.75h4.146c.483 0 .964.078 1.423.23l3.114 1.04c.46.153.94.231 1.423.231h.045c.36-.59.79-1.111 1.276-1.55ZM21.669 13.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z" />
    </svg>
  );
}
