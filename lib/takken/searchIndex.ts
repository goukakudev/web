/**
 * 全問題インデックスのクライアントロード (検索ページ用)。
 * /takken/questions.json (~4MB, gzip ~1MB) を一度だけ取得し、メモリに保持。
 */

export type SearchableQuestion = {
  id: string;
  exam_id: string;
  question_number: number;
  category: string;
  question_text: string;
  choices?: Record<string, string>;
  correct_answer: number | null;
  explanation_commentary?: string;
};

type RawQuestion = {
  id: string;
  exam_id: string;
  question_number: number;
  category: string;
  question_text: string;
  choices?: Record<string, string>;
  correct_answer?: number | null;
  explanation?: { commentary?: string | null } | null;
};

type Bundle = {
  version: number;
  questions: RawQuestion[];
};

let indexCache: SearchableQuestion[] | null = null;
let indexPromise: Promise<SearchableQuestion[]> | null = null;

export async function loadSearchIndex(): Promise<SearchableQuestion[]> {
  if (indexCache) return indexCache;
  if (!indexPromise) {
    indexPromise = fetch("/takken/questions.json", { cache: "force-cache" })
      .then(async (r) => {
        if (!r.ok)
          throw new Error(`Failed to load questions.json: ${r.status}`);
        return (await r.json()) as Bundle;
      })
      .then((bundle) =>
        bundle.questions.map((q) => ({
          id: q.id,
          exam_id: q.exam_id,
          question_number: q.question_number,
          category: q.category,
          question_text: q.question_text,
          choices: q.choices,
          correct_answer: q.correct_answer ?? null,
          explanation_commentary: q.explanation?.commentary ?? "",
        })),
      );
  }
  indexCache = await indexPromise;
  return indexCache;
}

export type SearchResult = SearchableQuestion & {
  score: number;
  hit: { field: string; preview: string };
};

/**
 * 簡易全文検索。すべて部分一致 (大文字小文字無視は不要、日本語は固定)。
 * - question_text のヒットは +3、choices は +2、commentary は +1
 * - hit.preview にはヒット箇所 ±40 文字を返す (UI 側でハイライト)
 */
export function searchQuestions(
  query: string,
  index: SearchableQuestion[],
  options: { category?: string; exam_id?: string; limit?: number } = {},
): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const results: SearchResult[] = [];
  for (const item of index) {
    if (options.category && item.category !== options.category) continue;
    if (options.exam_id && item.exam_id !== options.exam_id) continue;
    let score = 0;
    let hit: SearchResult["hit"] | null = null;

    const qIdx = item.question_text.indexOf(q);
    if (qIdx !== -1) {
      score += 3;
      hit = { field: "問題文", preview: previewAround(item.question_text, qIdx, q.length) };
    }
    if (!hit && item.choices) {
      for (const [, text] of Object.entries(item.choices)) {
        const i = text.indexOf(q);
        if (i !== -1) {
          score += 2;
          hit = { field: "選択肢", preview: previewAround(text, i, q.length) };
          break;
        }
      }
    }
    if (!hit && item.explanation_commentary) {
      const i = item.explanation_commentary.indexOf(q);
      if (i !== -1) {
        score += 1;
        hit = {
          field: "解説",
          preview: previewAround(item.explanation_commentary, i, q.length),
        };
      }
    }
    if (score > 0 && hit) {
      results.push({ ...item, score, hit });
    }
  }
  results.sort((a, b) => b.score - a.score);
  if (options.limit) return results.slice(0, options.limit);
  return results;
}

function previewAround(text: string, idx: number, len: number): string {
  const before = Math.max(0, idx - 30);
  const after = Math.min(text.length, idx + len + 40);
  const seg = text.slice(before, after);
  return (before > 0 ? "…" : "") + seg + (after < text.length ? "…" : "");
}
