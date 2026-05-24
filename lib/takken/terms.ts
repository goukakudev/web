/**
 * 宅建用語の辞書管理 (terms.json) と本文への自動リンク付与。
 * iOS 版 TermStore + RubyText の用語リンク機構と同等。
 *
 * - terms.json: { version, terms: { 用語名: { category, description } } }
 * - 検出: 長い用語から優先 (overlap-free greedy matching)
 * - 同一テキスト内では各用語の最初の 1 件のみリンク化 (二重リンク回避)
 * - URL は擬似スキーム不要、直接 onClick で popup を開く
 */

export type TermDefinition = {
  category: string;
  description: string;
};

export type TermsBundle = {
  version: number;
  terms: Record<string, TermDefinition>;
};

let termsCache: TermsBundle | null = null;
let termsPromise: Promise<TermsBundle> | null = null;
let orderedKeysCache: string[] | null = null;

export async function loadTerms(): Promise<TermsBundle> {
  if (termsCache) return termsCache;
  if (!termsPromise) {
    termsPromise = fetch("/takken/terms.json", { cache: "force-cache" }).then(
      (r) => {
        if (!r.ok) throw new Error(`Failed to load terms.json: ${r.status}`);
        return r.json() as Promise<TermsBundle>;
      },
    );
  }
  termsCache = await termsPromise;
  orderedKeysCache = Object.keys(termsCache.terms).sort(
    (a, b) => b.length - a.length,
  );
  return termsCache;
}

export function orderedTermKeys(): string[] {
  return orderedKeysCache ?? [];
}

export function termDefinition(term: string): TermDefinition | null {
  return termsCache?.terms[term] ?? null;
}

/**
 * 平文 text に対し、検出した用語の (位置, 用語名) 一覧を返す。
 * - 長い用語から優先 (orderedKeys)
 * - 各用語につき最初の 1 件のみ
 * - 既出 range と重なる場合はスキップ
 */
export type TermMatch = {
  start: number;
  end: number;
  term: string;
};

export function findTermMatches(text: string): TermMatch[] {
  const keys = orderedKeysCache;
  if (!keys || !text) return [];
  const matches: TermMatch[] = [];
  for (const term of keys) {
    let searchStart = 0;
    while (searchStart < text.length) {
      const idx = text.indexOf(term, searchStart);
      if (idx === -1) break;
      const end = idx + term.length;
      const overlap = matches.some(
        (m) => !(end <= m.start || idx >= m.end),
      );
      if (!overlap) {
        matches.push({ start: idx, end, term });
        break; // 最初の 1 件のみ
      } else {
        searchStart = idx + 1;
      }
    }
  }
  matches.sort((a, b) => a.start - b.start);
  return matches;
}
