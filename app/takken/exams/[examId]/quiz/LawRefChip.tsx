"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadLaws,
  parseLawRef,
  lookupArticles,
  type ResolvedArticle,
} from "@/lib/takken/laws";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; articles: ResolvedArticle[] }
  | { kind: "error"; message: string };

export function LawRefChip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });

  const openPopup = useCallback(async () => {
    setOpen(true);
    if (state.kind === "ready" || state.kind === "loading") return;
    setState({ kind: "loading" });
    try {
      const laws = await loadLaws();
      const ref = parseLawRef(text, laws);
      const articles = lookupArticles(ref, laws);
      setState({ kind: "ready", articles });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "読み込み失敗",
      });
    }
  }, [text, state.kind]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openPopup}
        className="inline-flex items-center gap-1 rounded-full border border-tk-gold-line bg-tk-gold-soft/60 px-3 py-1 text-[11px] font-medium text-tk-gold transition hover:bg-tk-gold-soft hover:text-tk-charcoal active:scale-[0.98]"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>{text}</span>
      </button>
      {open && (
        <LawRefPopup
          rawText={text}
          state={state}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function LawRefPopup({
  rawText,
  state,
  onClose,
}: {
  rawText: string;
  state: State;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={rawText}
    >
      <div
        className="absolute inset-0 bg-tk-charcoal/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-t-2xl bg-tk-card text-tk-ink shadow-2xl sm:rounded-2xl">
        <div className="flex items-start gap-3 border-b border-tk-line px-5 py-4">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-tk-ink-3">
              関連条文・判例
            </div>
            <div className="mt-1 font-mincho text-base font-medium leading-snug text-tk-ink">
              {rawText}
            </div>
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
          <LawRefBody state={state} />
        </div>
        <div className="border-t border-tk-line px-5 py-3 text-[10px] leading-relaxed text-tk-ink-3">
          ※ 条文は学習目的の参考表示です。正本は e-Gov 法令検索等の公式情報をご確認ください。
        </div>
      </div>
    </div>
  );
}

function LawRefBody({ state }: { state: State }) {
  if (state.kind === "idle" || state.kind === "loading") {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-tk-ink-3">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-tk-gold border-t-transparent" />
        条文を読み込み中…
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <p className="py-4 text-sm text-tk-crimson">
        条文の読み込みに失敗しました: {state.message}
      </p>
    );
  }
  if (state.articles.length === 0) {
    return (
      <div className="py-4 text-sm leading-relaxed text-tk-ink-2">
        <p>この項目は条文データを準備中です。</p>
        <p className="mt-2 text-tk-ink-3">
          判例・告示・基準など条文形式でないもの、または当アプリ未収録の法令は表示できません。
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {state.articles.map((art, i) => (
        <article
          key={`${art.lawName}-${art.articleKey}-${i}`}
          className="space-y-1.5"
        >
          <header>
            <div className="text-[11px] tracking-wide text-tk-gold">
              {art.lawName} {art.articleLabel}
            </div>
            <h3 className="font-mincho text-[15px] font-medium text-tk-ink">
              {art.title}
            </h3>
          </header>
          <pre className="whitespace-pre-wrap break-words font-sans text-[13.5px] leading-[1.85] text-tk-ink-2">
            {art.body}
          </pre>
        </article>
      ))}
    </div>
  );
}
