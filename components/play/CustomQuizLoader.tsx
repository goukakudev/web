"use client";

/**
 * 問題ID リストを受け取り、各 ID から問題本文を fetch して QuizClient に流す。
 * 間違い直し (/takken/wrong) / ブックマーク (/takken/bookmarks) で共有利用。
 */
import { useEffect, useState } from "react";
import type { TakkenQuestion } from "@/lib/takken/api";
import QuizClient from "@/app/takken/exams/[examId]/quiz/QuizClient";

export function CustomQuizLoader({
  ids,
  breadcrumb,
  emptyMessage,
}: {
  ids: string[];
  breadcrumb: string;
  emptyMessage: string;
}) {
  const [questions, setQuestions] = useState<TakkenQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (ids.length === 0) {
      queueMicrotask(() => {
        if (!cancelled) setQuestions([]);
      });
      return;
    }
    (async () => {
      try {
        const fetched = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`/api/tk/questions/${encodeURIComponent(id)}`);
            if (!res.ok) return null;
            return (await res.json()) as TakkenQuestion;
          }),
        );
        if (cancelled) return;
        const valid = fetched.filter(
          (q): q is TakkenQuestion => q !== null && q !== undefined,
        );
        setQuestions(valid);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "load_error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm text-tk-crimson">読み込みに失敗しました: {error}</p>
      </div>
    );
  }

  if (questions === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-tk-ink-3">
        読み込み中…
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm text-tk-ink-2">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <QuizClient
      examId="custom"
      breadcrumb={breadcrumb}
      questions={questions}
      mode="instant"
    />
  );
}
