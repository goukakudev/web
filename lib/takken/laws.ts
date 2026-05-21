/**
 * 関連条文・判例 (key_law) パーサ + 法令データロード。
 * 例:
 *   "宅建業法64条の2(履行確保措置)"   → { lawName:"宅地建物取引業法", articleKeys:["64-2"], description:"履行確保措置" }
 *   "区分所有法11条・12条(共用部分の帰属)" → { articleKeys:["11","12"] }
 *   "国土利用計画法23条1項・2項(事後届出)" → 項は無視、article=23
 *
 * クライアントから動的に `/takken/laws.json` を fetch する。
 * 366KB / gzip ~50KB。 最初の popup を開いた時に一度だけロード。
 */

export type LawArticle = {
  title: string;
  body: string;
};

export type Law = {
  aliases: string[];
  articles: Record<string, LawArticle>;
};

export type LawsData = Record<string, Law>;

export type LawRef = {
  raw: string;
  lawName: string | null;
  articleKeys: string[];
  description: string | null;
};

export type ResolvedArticle = {
  lawName: string;
  articleKey: string;
  articleLabel: string; // e.g. "11条" or "64条の2"
  title: string;
  body: string;
};

let lawsCache: LawsData | null = null;
let lawsPromise: Promise<LawsData> | null = null;
let aliasMapCache: Array<[string, string]> | null = null;

export async function loadLaws(): Promise<LawsData> {
  if (lawsCache) return lawsCache;
  if (!lawsPromise) {
    lawsPromise = fetch("/takken/laws.json", { cache: "force-cache" }).then(
      (r) => {
        if (!r.ok) throw new Error(`Failed to load laws.json: ${r.status}`);
        return r.json() as Promise<LawsData>;
      },
    );
  }
  lawsCache = await lawsPromise;
  return lawsCache;
}

function buildAliasMap(laws: LawsData): Array<[string, string]> {
  if (aliasMapCache && lawsCache === laws) return aliasMapCache;
  const out: Array<[string, string]> = [];
  for (const [canonical, body] of Object.entries(laws)) {
    out.push([canonical, canonical]);
    for (const alias of body.aliases || []) {
      if (alias !== canonical) out.push([alias, canonical]);
    }
  }
  out.sort((a, b) => b[0].length - a[0].length);
  aliasMapCache = out;
  return out;
}

export function parseLawRef(text: string, laws: LawsData): LawRef {
  const raw = text.trim();
  let head = raw;
  let description: string | null = null;

  const parenMatch = raw.match(/^(.+?)[(（]([^)）]+)[)）]\s*$/);
  if (parenMatch) {
    head = parenMatch[1].trim();
    description = parenMatch[2].trim();
  }

  const aliasMap = buildAliasMap(laws);
  let lawName: string | null = null;
  let rest = head;
  for (const [alias, canonical] of aliasMap) {
    if (head.startsWith(alias)) {
      lawName = canonical;
      rest = head.slice(alias.length);
      break;
    }
  }

  const articleKeys: string[] = [];
  const re = /(\d+)条(?:の(\d+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest)) !== null) {
    articleKeys.push(m[2] ? `${m[1]}-${m[2]}` : m[1]);
  }

  return { raw, lawName, articleKeys, description };
}

export function lookupArticles(ref: LawRef, laws: LawsData): ResolvedArticle[] {
  if (!ref.lawName || ref.articleKeys.length === 0) return [];
  const law = laws[ref.lawName];
  if (!law) return [];
  const out: ResolvedArticle[] = [];
  for (const key of ref.articleKeys) {
    const art = law.articles[key];
    if (!art) continue;
    const label = key.includes("-")
      ? `${key.split("-")[0]}条の${key.split("-")[1]}`
      : `${key}条`;
    out.push({
      lawName: ref.lawName,
      articleKey: key,
      articleLabel: label,
      title: art.title,
      body: art.body,
    });
  }
  return out;
}
