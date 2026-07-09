import { describe, expect, it, vi } from "vitest"
import {
  SITEMAP_NAMES,
  sitemapEntries,
  sitemapIndexXml,
  urlsetXml,
} from "@/lib/seo/sitemaps"
import type { ExamSummary, Question } from "@/lib/types"

vi.mock("@/lib/api-client", () => ({
  listExams: vi.fn(async () => [
    {
      exam_id: "fe-2023h",
      exam: "FE",
      year: "2023",
      section: "科目A",
      question_count: 2,
    } satisfies ExamSummary,
  ]),
  listQuestions: vi.fn(async () => [
    thickQuestion(1, "cpu"),
    thinQuestion(2),
  ]),
  listIpExams: vi.fn(async () => [
    {
      exam_id: "ip-2025r07",
      exam: "IP",
      year: "2025",
      section: "通年",
      question_count: 2,
    } satisfies ExamSummary,
  ]),
  listIpQuestions: vi.fn(async () => [
    thickQuestion(1, "gisou-ukeoi"),
    thinQuestion(2),
  ]),
  listSgExams: vi.fn(async () => [
    {
      exam_id: "sg-2025r07-a",
      exam: "SG",
      year: "2025",
      section: "科目A",
      question_count: 2,
    } satisfies ExamSummary,
  ]),
  listSgQuestions: vi.fn(async () => [
    thickQuestion(1, "zero-trust"),
    thinQuestion(2),
  ]),
}))

vi.mock("@/lib/takken/api", () => ({
  TakkenAPI: {
    listExams: vi.fn(async () => [
      {
        exam_id: "tk-r5",
        era: "令和",
        era_year: 5,
        exam_month: 10,
        year: 2023,
        label: "令和5年",
        passing_score: 36,
        question_count: 50,
      },
    ]),
    listExamQuestions: vi.fn(async () => ({
      questions: [{ id: "q1", q_number: 1 }],
    })),
  },
}))

function thickQuestion(qNumber: number, topic: string): Question {
  return {
    _id: `q-${qNumber}`,
    kind: "mcq",
    exam_id: "x",
    q_number: qNumber,
    body: `${topic} の問題文`,
    choices: [
      { label: "ア", text: "A" },
      { label: "イ", text: "B" },
      { label: "ウ", text: "C" },
      { label: "エ", text: "D" },
    ],
    correct_label: "ア",
    tags: [`#${topic}`],
    explanation: {
      overall: "あ".repeat(80),
      per_choice: [
        { label: "ア", text: "い".repeat(30) },
        { label: "イ", text: "う".repeat(30) },
        { label: "ウ", text: "え".repeat(30) },
        { label: "エ", text: "お".repeat(30) },
      ],
    },
  }
}

function thinQuestion(qNumber: number): Question {
  return {
    _id: `q-thin-${qNumber}`,
    kind: "mcq",
    exam_id: "x",
    q_number: qNumber,
    body: "薄い問題",
    choices: [
      { label: "ア", text: "A" },
      { label: "イ", text: "B" },
      { label: "ウ", text: "C" },
      { label: "エ", text: "D" },
    ],
    correct_label: "ア",
    explanation: {
      overall: "短い",
      per_choice: [{ label: "ア", text: "x" }],
    },
  }
}

describe("split sitemaps", () => {
  it("exposes static, glossary, and FE/IP/SG question sitemaps", () => {
    expect([...SITEMAP_NAMES]).toEqual([
      "static",
      "glossary",
      "ip-questions",
      "fe-questions",
      "sg-questions",
    ])
  })

  it("emits a sitemap index with FE/IP/SG question sitemaps", () => {
    const xml = sitemapIndexXml(new Date("2026-01-01T00:00:00.000Z"))
    expect(xml).toContain("<sitemapindex")
    expect(xml).toContain("https://goukaku.dev/sitemaps/static.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/glossary.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/ip-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/fe-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/sg-questions.xml")
    expect(xml).not.toContain("ap-questions")
    expect(xml).not.toContain("takken-questions")
  })

  it("static sitemap includes FE/IP/SG exam hubs and takken exam/quiz bases", async () => {
    const urls = (await sitemapEntries("static")).map((entry) => entry.url)
    expect(urls).toContain("https://goukaku.dev/")
    expect(urls).toContain("https://goukaku.dev/ip")
    expect(urls).toContain("https://goukaku.dev/sg/questions")
    expect(urls).toContain("https://goukaku.dev/takken/exams")
    expect(urls).toContain("https://goukaku.dev/ip/exam/ip-2025r07")
    expect(urls).toContain("https://goukaku.dev/fe/exam/fe-2023h")
    expect(urls).toContain("https://goukaku.dev/sg/exam/sg-2025r07-a")
    expect(urls).toContain("https://goukaku.dev/takken/exams/tk-r5")
    expect(urls).toContain("https://goukaku.dev/takken/exams/tk-r5/quiz")

    // まだ閉じているセクションと薄い集約は載せない。
    expect(urls).not.toContain("https://goukaku.dev/sc")
    expect(urls).not.toContain("https://goukaku.dev/denki")
    expect(urls).not.toContain("https://goukaku.dev/kango")
    expect(urls.some((url) => url.includes("/category/"))).toBe(false)
    expect(urls.some((url) => url.includes("/play/"))).toBe(false)
    expect(urls.some((url) => url.includes("/ap/exam/"))).toBe(false)
    expect(urls.some((url) => url.includes("?q="))).toBe(false)
  })

  it("urlset renderer allows new hubs and rejects play/folded URLs", () => {
    const xml = urlsetXml([
      { url: "https://goukaku.dev/ip/guide" },
      { url: "https://goukaku.dev/ip/guide" },
      { url: "https://goukaku.dev/ip/questions/2025-r07-q1-gisou-ukeoi" },
      { url: "https://goukaku.dev/sg/questions/2025-r07-a-q1-zero-trust" },
      { url: "https://goukaku.dev/fe/exam/fe-2023h" },
      { url: "https://goukaku.dev/takken/exams/tk-r5/quiz" },
      { url: "https://goukaku.dev/ip/play/ip-2025r07/q/1" },
      { url: "https://goukaku.dev/ap/play/ap-2025r07-a/q/1" },
      { url: "https://goukaku.dev/takken/exams/tk-r5/quiz?q=2" },
      { url: "https://goukaku.dev/sc" },
      { url: "https://goukaku.dev/takken/search" },
    ])
    // guide, ip q, sg q, fe exam, takken quiz — ?q=2 は path 正規化後に quiz と同一なので重複排除
    expect(xml.match(/<url>/g)).toHaveLength(5)
    expect(xml).toContain("https://goukaku.dev/ip/guide")
    expect(xml).toContain("/ip/questions/")
    expect(xml).toContain("/sg/questions/")
    expect(xml).toContain("/fe/exam/fe-2023h")
    expect(xml).toContain("/takken/exams/tk-r5/quiz")
    expect(xml).not.toContain("?q=")
    expect(xml).not.toContain("/play/")
    expect(xml).not.toContain("https://goukaku.dev/sc")
  })

  it("question sitemaps include only quality-passing questions for FE/IP/SG", async () => {
    const ip = await sitemapEntries("ip-questions")
    const fe = await sitemapEntries("fe-questions")
    const sg = await sitemapEntries("sg-questions")
    expect(ip).toHaveLength(1)
    expect(fe).toHaveLength(1)
    expect(sg).toHaveLength(1)
    expect(ip[0].url).toContain("/ip/questions/")
    expect(fe[0].url).toContain("/fe/questions/")
    expect(sg[0].url).toContain("/sg/questions/")
    expect(ip.some((e) => e.url.includes("q2") || e.url.includes("-q2-"))).toBe(
      false,
    )
  })

  it("omits lastmod because real modification dates are unknown", async () => {
    for (const name of ["static", "glossary"] as const) {
      const entries = await sitemapEntries(name)
      expect(entries.length).toBeGreaterThan(0)
      expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true)
      expect(urlsetXml(entries)).not.toContain("<lastmod>")
    }
  })

  it("glossary sitemap includes canonical glossary pages with enough study context", async () => {
    const glossary = (await sitemapEntries("glossary")).map((entry) => entry.url)
    expect(glossary).toContain("https://goukaku.dev/glossary/%E5%81%BD%E8%A3%85%E8%AB%8B%E8%B2%A0")
    expect(glossary).toContain("https://goukaku.dev/glossary/2%E7%9B%B8%E3%82%B3%E3%83%9F%E3%83%83%E3%83%88")
  })

  it("glossary sitemap uses hyphenated slugs for reserved-character terms", async () => {
    const glossary = (await sitemapEntries("glossary")).map((entry) => entry.url)
    expect(glossary).toContain("https://goukaku.dev/glossary/S-MIME")
    expect(glossary).toContain("https://goukaku.dev/glossary/JPCERT-CC")
    expect(glossary.some((url) => url.includes("%2F"))).toBe(false)
    expect(glossary.some((url) => url.includes("%20"))).toBe(false)
  })

  it("glossary sitemap URLs pass the indexing policy filter", async () => {
    const entries = await sitemapEntries("glossary")
    const xml = urlsetXml(entries)
    expect(xml.match(/<url>/g)).toHaveLength(entries.length)
  })
})
