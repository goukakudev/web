import { describe, expect, it } from "vitest"
import { glossaryQuality } from "@/lib/seo/glossary-quality"
import type { GlossaryEntry } from "@/lib/seo/glossary"

function entry(term: string, description: string): GlossaryEntry {
  return {
    term,
    reading: term,
    category: "テスト",
    description,
  }
}

describe("glossaryQuality", () => {
  it("noindexes short non-priority definitions", () => {
    const result = glossaryQuality(entry("短い用語", "短い説明です。意味は分かるが検索ページとしては薄い。"))
    expect(result.indexable).toBe(false)
    expect(result.reason).toBe("thin_definition")
  })

  it("keeps priority terms indexable", () => {
    const result = glossaryQuality(entry("偽装請負", "短い説明でも重要語として残す。"))
    expect(result.indexable).toBe(true)
    expect(result.reason).toBe("priority_term")
  })

  it("indexes 100+ character definitions because glossary pages add study context", () => {
    const description = "あ".repeat(100)
    const result = glossaryQuality(entry("十分な用語", description))
    expect(result.indexable).toBe(true)
    expect(result.reason).toBe("definition_length_with_study_sections")
  })
})
