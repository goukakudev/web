import { listAllTerms, termToSlug } from "./glossary"

interface IndexedTerm {
  term: string
  slug: string
}

/** firstChar → terms starting with that char, sorted by length desc. */
let CACHED_INDEX: Map<string, IndexedTerm[]> | null = null

function getIndex(): Map<string, IndexedTerm[]> {
  if (CACHED_INDEX) return CACHED_INDEX
  const idx = new Map<string, IndexedTerm[]>()
  for (const e of listAllTerms()) {
    const first = e.term[0]
    if (!first) continue
    const list = idx.get(first) ?? []
    list.push({ term: e.term, slug: termToSlug(e.term) })
    idx.set(first, list)
  }
  for (const list of idx.values()) {
    list.sort((a, b) => b.term.length - a.term.length)
  }
  CACHED_INDEX = idx
  return idx
}

export interface MatcherChunk {
  type: "text" | "term"
  text: string
  /** Defined only for type="term" — the URL-encoded slug for that term. */
  slug?: string
}

/**
 * Scan `text` for glossary terms and return chunks. First-occurrence-only per
 * term to avoid noisy repeat-linking. Uses a first-character index so the
 * inner loop only considers terms that can possibly match at position i —
 * dropping the per-position cost from O(N_terms) to O(few-candidates).
 * Bounded enough to stay well under Cloudflare Workers' CPU budget per
 * request even on long question bodies.
 */
export function matchGlossaryTerms(text: string): MatcherChunk[] {
  if (!text) return [{ type: "text", text: "" }]
  const idx = getIndex()
  const used = new Set<string>()
  const chunks: MatcherChunk[] = []
  let buf = ""
  let i = 0
  const len = text.length
  while (i < len) {
    const ch = text[i]
    const candidates = idx.get(ch)
    let matched: IndexedTerm | undefined
    if (candidates) {
      for (const c of candidates) {
        if (used.has(c.term)) continue
        if (text.startsWith(c.term, i)) {
          matched = c
          break
        }
      }
    }
    if (matched) {
      if (buf.length > 0) {
        chunks.push({ type: "text", text: buf })
        buf = ""
      }
      chunks.push({ type: "term", text: matched.term, slug: matched.slug })
      used.add(matched.term)
      i += matched.term.length
    } else {
      buf += ch
      i++
    }
  }
  if (buf.length > 0) chunks.push({ type: "text", text: buf })
  return chunks
}
