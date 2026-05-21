"use client";

import { useEffect } from "react";
import type { GlossaryEntry } from "@/lib/glossary";

export interface GlossaryModalProps {
  entry: GlossaryEntry | null;
  onClose: () => void;
}

export function GlossaryModal({ entry, onClose }: GlossaryModalProps) {
  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [entry, onClose]);

  if (!entry) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full sm:max-w-md bg-goukaku-bg rounded-t-[20px] sm:rounded-[20px] border border-goukaku-divider shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-term"
      >
        <div className="flex items-start gap-3 p-5 border-b border-goukaku-divider">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline flex-wrap gap-2">
              <h2
                id="glossary-term"
                className="text-[18px] font-extrabold text-goukaku-ink leading-tight"
              >
                {entry.term}
              </h2>
              {entry.reading ? (
                <span className="text-[12px] text-goukaku-ink/55">
                  {entry.reading}
                </span>
              ) : null}
            </div>
            {entry.category ? (
              <div className="mt-1.5 inline-block text-[10px] tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-goukaku-cool/40 text-goukaku-ink">
                {entry.category}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 rounded-full bg-goukaku-surface border border-goukaku-divider text-[14px] flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <div className="p-5 overflow-y-auto text-[14px] leading-[1.8] text-goukaku-ink/85">
          {entry.description}
        </div>
      </div>
    </div>
  );
}
