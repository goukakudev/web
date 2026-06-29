import type { GlossaryEntry } from "@/lib/seo/glossary"

const MIN_INDEXABLE_DESCRIPTION_LENGTH = 100

const ALWAYS_INDEX_TERMS = new Set([
  "偽装請負",
  "機械学習",
  "RPA",
  "PKI",
  "共通鍵暗号方式",
  "正規化",
  "SLA",
  "BCP",
  "SWOT分析",
  "損益分岐点",
  "ゼロトラスト",
])

export function glossaryQuality(entry: GlossaryEntry) {
  const descriptionLength = [...entry.description.trim()].length
  const hasEnoughDefinition = descriptionLength >= MIN_INDEXABLE_DESCRIPTION_LENGTH
  const forceIndex = ALWAYS_INDEX_TERMS.has(entry.term)
  return {
    descriptionLength,
    indexable: forceIndex || hasEnoughDefinition,
    reason: forceIndex
      ? "priority_term"
      : hasEnoughDefinition
        ? "definition_length_with_study_sections"
        : "thin_definition",
  }
}

export function isIndexableGlossaryEntry(entry: GlossaryEntry): boolean {
  return glossaryQuality(entry).indexable
}
