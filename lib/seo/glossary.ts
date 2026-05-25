import glossaryData from "@/lib/glossary-data.json"

export interface GlossaryEntry {
  term: string
  reading: string
  category: string
  description: string
}

const ALL: GlossaryEntry[] = glossaryData as GlossaryEntry[]

export function listAllTerms(): GlossaryEntry[] {
  return ALL
}

export function termToSlug(term: string): string {
  return encodeURIComponent(term)
}

export function slugToTerm(slug: string): string {
  return decodeURIComponent(slug)
}

export function findByTerm(term: string): GlossaryEntry | undefined {
  return ALL.find((e) => e.term === term)
}

export function listByCategory(): Map<string, GlossaryEntry[]> {
  const m = new Map<string, GlossaryEntry[]>()
  for (const e of ALL) {
    const list = m.get(e.category) ?? []
    list.push(e)
    m.set(e.category, list)
  }
  for (const [, list] of m) {
    list.sort((a, b) => a.reading.localeCompare(b.reading, "ja"))
  }
  return m
}

export function findRelated(entry: GlossaryEntry, limit = 5): GlossaryEntry[] {
  return ALL.filter(
    (e) => e.term !== entry.term && e.category === entry.category,
  )
    .sort((a, b) => a.reading.localeCompare(b.reading, "ja"))
    .slice(0, limit)
}
