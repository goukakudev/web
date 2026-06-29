import { describe, expect, it } from "vitest"
import {
  getGlossaryTermEnrichment,
  scoreGlossaryQuestionText,
} from "@/lib/seo/glossary-term-enrichment"

describe("glossary term enrichment", () => {
  it("provides individual examples for priority search terms", () => {
    const terms = [
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
    ]

    for (const term of terms) {
      const enrichment = getGlossaryTermEnrichment(term)
      expect(enrichment?.examples.length).toBeGreaterThanOrEqual(2)
      expect(enrichment?.mistakes.length).toBeGreaterThanOrEqual(2)
      expect(enrichment?.questionKeywords.length).toBeGreaterThanOrEqual(5)
    }
  })

  it("scores strong related question text for exact and synonym matches", () => {
    const result = scoreGlossaryQuestionText(
      "PKI",
      "PKIにおけるCA(Certificate Authority)の役割とCRLを問う。",
    )
    expect(result.score).toBeGreaterThanOrEqual(200)
    expect(result.matchedKeywords).toContain("PKI")
    expect(result.matchedKeywords).toContain("Certificate Authority")
  })

  it("does not treat broad short words as priority matches", () => {
    const result = scoreGlossaryQuestionText(
      "PKI",
      "ITサービスマネジメントのPDCAモデルに関する問題。",
    )
    expect(result.score).toBe(0)
    expect(result.matchedKeywords).toEqual([])
  })
})
