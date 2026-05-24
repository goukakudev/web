"use client";

/**
 * 用語タップ時に表示するポップアップ (iOS 版 TermSheet 相当)。
 * terms.json から定義を読み出し、category + description を表示。
 */
import { useEffect } from "react";
import { termDefinition } from "@/lib/takken/terms";

export function TermSheet({
  term,
  onClose,
}: {
  term: string;
  onClose: () => void;
}) {
  const def = termDefinition(term);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={term}
    >
      <div
        className="absolute inset-0 bg-tk-charcoal/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-tk-card text-tk-ink shadow-2xl sm:rounded-2xl">
        <div className="flex items-start gap-3 border-b border-tk-line px-5 py-4">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-tk-ink-3">
              用語
            </div>
            <div className="mt-1 font-mincho text-lg font-medium leading-snug text-tk-ink">
              {term}
            </div>
            {def && (
              <div className="mt-1 text-[11px] text-tk-gold">{def.category}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-tk-ink-3 transition hover:bg-tk-canvas hover:text-tk-ink"
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
        </div>
        <div className="overflow-y-auto px-5 py-4">
          {def ? (
            <p className="whitespace-pre-line text-[14px] leading-[1.85] text-tk-ink">
              {def.description}
            </p>
          ) : (
            <p className="py-4 text-sm leading-relaxed text-tk-ink-3">
              この用語の定義は準備中です。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
