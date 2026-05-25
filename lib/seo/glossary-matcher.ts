import { listAllTerms, termToSlug } from "./glossary"

let CACHED_TERMS: string[] | null = null

function getSortedTerms(): string[] {
  if (CACHED_TERMS) return CACHED_TERMS
  // Sort by length descending so longer terms match before their substrings.
  CACHED_TERMS = listAllTerms()
    .map((e) => e.term)
    .sort((a, b) => b.length - a.length)
  return CACHED_TERMS
}

export interface MatcherChunk {
  type: "text" | "term"
  text: string
  /** Defined only for type="term" — the URL-encoded slug for that term. */
  slug?: string
}

/**
 * Scan `text` for glossary terms and return chunks. Each chunk is either
 * plain text or a recognized term with its slug. A single term is matched
 * at most once per call to avoid noisy repeated links in the same passage.
 */
export function matchGlossaryTerms(text: string): MatcherChunk[] {
  if (!text) return [{ type: "text", text: "" }]
  const terms = getSortedTerms()
  const used = new Set<string>()
  // Greedy left-to-right scan over the source string.
  let i = 0
  const chunks: MatcherChunk[] = []
  let buf = ""
  outer: while (i < text.length) {
    for (const t of terms) {
      if (used.has(t)) continue
      if (text.startsWith(t, i)) {
        if (buf.length > 0) {
          chunks.push({ type: "text", text: buf })
          buf = ""
        }
        chunks.push({ type: "term", text: t, slug: termToSlug(t) })
        used.add(t)
        i += t.length
        continue outer
      }
    }
    buf += text[i]
    i++
  }
  if (buf.length > 0) chunks.push({ type: "text", text: buf })
  return chunks
}
