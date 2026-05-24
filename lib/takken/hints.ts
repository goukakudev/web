/**
 * 手書きヒント (hints.json) の管理。iOS 版 HintStore 相当。
 * hints.json: { "<question_id>": "<hint text>" }
 *
 * フォールバック: 該当 ID が無い場合は deriveTkHint (lib/takken/feedback.ts) を使う。
 */

export type HintDict = Record<string, string>;

let hintsCache: HintDict | null = null;
let hintsPromise: Promise<HintDict> | null = null;

export async function loadHints(): Promise<HintDict> {
  if (hintsCache) return hintsCache;
  if (!hintsPromise) {
    hintsPromise = fetch("/takken/hints.json", { cache: "force-cache" }).then(
      (r) => {
        if (!r.ok) throw new Error(`Failed to load hints.json: ${r.status}`);
        return r.json() as Promise<HintDict>;
      },
    );
  }
  hintsCache = await hintsPromise;
  return hintsCache;
}

export function getHintFromCache(questionId: string): string | null {
  return hintsCache?.[questionId] ?? null;
}
