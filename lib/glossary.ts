import rawData from "./glossary-data.json";

export interface GlossaryEntry {
  term: string;
  reading?: string | null;
  category?: string | null;
  description: string;
}

export interface GlossaryMatch {
  start: number;
  end: number;
  term: string;
}

const entries: GlossaryEntry[] = rawData as GlossaryEntry[];
const byTerm = new Map<string, GlossaryEntry>(entries.map((e) => [e.term, e]));
const termsSortedByLength = entries
  .map((e) => e.term)
  .sort((a, b) => b.length - a.length);

const matchCache = new Map<string, GlossaryMatch[]>();
const MATCH_CACHE_LIMIT = 256;

function cachedMatches(text: string): GlossaryMatch[] {
  const hit = matchCache.get(text);
  if (hit) return hit;

  const covered = new Array<boolean>(text.length).fill(false);
  const found: GlossaryMatch[] = [];
  for (const term of termsSortedByLength) {
    let searchStart = 0;
    // Only the first non-overlapping occurrence of each term is linked,
    // even when the term appears multiple times in the same text.
    while (searchStart <= text.length - term.length) {
      const idx = text.indexOf(term, searchStart);
      if (idx < 0) break;
      const end = idx + term.length;
      let overlap = false;
      for (let i = idx; i < end; i++) {
        if (covered[i]) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        found.push({ start: idx, end, term });
        for (let i = idx; i < end; i++) covered[i] = true;
        break;
      }
      searchStart = end;
    }
  }

  if (matchCache.size >= MATCH_CACHE_LIMIT) {
    // crude LRU: drop oldest insertion
    const firstKey = matchCache.keys().next().value;
    if (firstKey !== undefined) matchCache.delete(firstKey);
  }
  matchCache.set(text, found);
  return found;
}

/**
 * Find non-overlapping glossary matches in `text`. Longer terms win over
 * shorter ones. `exclude` filters out terms already linked elsewhere in the
 * same question, so each term is only linked once per question.
 */
export function findGlossaryMatches(
  text: string,
  exclude: ReadonlySet<string> = new Set(),
): GlossaryMatch[] {
  const all = cachedMatches(text);
  if (exclude.size === 0) return all;
  return all.filter((m) => !exclude.has(m.term));
}

/**
 * Set of terms that would be linked given the same arguments. Helper for
 * threading the "already linked" set through to subsequent text blocks.
 */
export function usedGlossaryTerms(
  text: string,
  exclude: ReadonlySet<string> = new Set(),
): Set<string> {
  return new Set(findGlossaryMatches(text, exclude).map((m) => m.term));
}

export function getGlossaryEntry(term: string): GlossaryEntry | undefined {
  return byTerm.get(term);
}
