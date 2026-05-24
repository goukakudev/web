/**
 * ふりがな (ruby.json) の管理。iOS 版 RubyStore 相当。
 * 非常用漢字や読みにくい熟語にルビを振る。
 *
 * ruby.json:
 *   { "瑕疵": "かし", "心裡": "しんり", ... }
 */

export type RubyDict = Record<string, string>;

type RubyBundle = {
  version: number;
  ruby: RubyDict;
};

let rubyCache: RubyDict | null = null;
let rubyPromise: Promise<RubyDict> | null = null;
let orderedKeysCache: string[] | null = null;

export async function loadRuby(): Promise<RubyDict> {
  if (rubyCache) return rubyCache;
  if (!rubyPromise) {
    rubyPromise = fetch("/takken/ruby.json", { cache: "force-cache" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load ruby.json: ${r.status}`);
        return (await r.json()) as RubyBundle | RubyDict;
      })
      .then((raw) => {
        // 両方の形に対応 ({ ruby: {...} } / フラット)
        if (raw && typeof raw === "object" && "ruby" in raw) {
          return (raw as RubyBundle).ruby;
        }
        return raw as RubyDict;
      });
  }
  rubyCache = await rubyPromise;
  orderedKeysCache = Object.keys(rubyCache).sort((a, b) => b.length - a.length);
  return rubyCache;
}

export function orderedRubyKeys(): string[] {
  return orderedKeysCache ?? [];
}

export type RubyMatch = {
  start: number;
  end: number;
  word: string;
  reading: string;
};

/**
 * 平文 text から、全ての ruby word 出現位置を返す (全件、用語リンクと違い 1 件限定でない)。
 * orderedKeys (長い順) で検出し、既マッチ range と重ならないように追加。
 */
export function findRubyMatches(text: string): RubyMatch[] {
  if (!rubyCache || !orderedKeysCache || !text) return [];
  const matches: RubyMatch[] = [];
  for (const word of orderedKeysCache) {
    const reading = rubyCache[word];
    if (!reading) continue;
    let searchStart = 0;
    while (searchStart < text.length) {
      const idx = text.indexOf(word, searchStart);
      if (idx === -1) break;
      const end = idx + word.length;
      const overlap = matches.some((m) => !(end <= m.start || idx >= m.end));
      if (!overlap) {
        matches.push({ start: idx, end, word, reading });
      }
      searchStart = idx + word.length;
    }
  }
  matches.sort((a, b) => a.start - b.start);
  return matches;
}
