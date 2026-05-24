"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  loadSearchIndex,
  searchQuestions,
  type SearchableQuestion,
  type SearchResult,
} from "@/lib/takken/searchIndex";

const CATEGORIES = ["権利関係", "宅建業法", "法令上の制限", "税その他"];

export default function SearchClient() {
  const [index, setIndex] = useState<SearchableQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadSearchIndex()
      .then((data) => {
        if (!cancelled) {
          setIndex(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "load_error");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const results: SearchResult[] = useMemo(() => {
    if (!index) return [];
    return searchQuestions(query, index, {
      category: category || undefined,
      limit: 100,
    });
  }, [query, category, index]);

  return (
    <div className="mt-6 space-y-5">
      <div className="space-y-2">
        <input
          type="search"
          autoFocus
          placeholder="例: 抵当権 / 重要事項説明 / 8種制限"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-tk-line bg-tk-card px-4 py-3 text-[15px] text-tk-ink outline-none focus:border-tk-gold"
        />
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="すべて"
            active={category === ""}
            onClick={() => setCategory("")}
          />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-sm text-tk-ink-3">インデックスを読み込み中…</p>
      )}
      {error && (
        <p className="text-sm text-tk-crimson">読み込み失敗: {error}</p>
      )}
      {!loading && !error && query.trim() !== "" && (
        <p className="text-xs tracking-wide text-tk-ink-3">
          {results.length} 件ヒット
        </p>
      )}

      <ul className="space-y-3">
        {results.map((r) => (
          <li key={r.id}>
            <Link
              href={`/takken/exams/${r.exam_id}/quiz`}
              className="block rounded-xl border border-tk-line bg-tk-card p-4 transition hover:border-tk-gold-line hover:bg-tk-gold-soft/30"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mincho text-sm font-medium text-tk-ink">
                  {r.exam_id} Q{r.question_number}
                </span>
                <span className="text-[11px] text-tk-gold">{r.category}</span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-tk-ink-2">
                <span className="mr-1 inline-flex rounded bg-tk-canvas px-1.5 py-0.5 text-[10px] tracking-wide text-tk-ink-3">
                  {r.hit.field}
                </span>
                <HighlightedText
                  text={r.hit.preview}
                  query={query}
                />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${
        active
          ? "border-tk-gold-line bg-tk-gold-soft text-tk-gold"
          : "border-tk-line bg-tk-bg text-tk-ink-2 hover:bg-tk-canvas"
      }`}
    >
      {label}
    </button>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <span>{text}</span>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const idx = text.indexOf(query, cursor);
    if (idx === -1) {
      parts.push(<span key={cursor}>{text.slice(cursor)}</span>);
      break;
    }
    if (cursor < idx) {
      parts.push(<span key={cursor}>{text.slice(cursor, idx)}</span>);
    }
    parts.push(
      <mark
        key={`hl-${idx}`}
        className="rounded bg-tk-gold-soft px-0.5 text-tk-gold"
      >
        {text.slice(idx, idx + query.length)}
      </mark>,
    );
    cursor = idx + query.length;
  }
  return <>{parts}</>;
}
