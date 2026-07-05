import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/api-client", () => ({
  listExams: vi.fn(async () => [
    { exam_id: "fe-2023h", exam: "FE", year: "2023", section: "春期", question_count: 2 },
    { exam_id: "ap-2023h", exam: "AP", year: "2023", section: "春期", question_count: 1 },
  ]),
  listQuestions: vi.fn(async (id: string) =>
    id === "fe-2023h"
      ? [
          { _id: "q1", kind: "q", exam_id: id, q_number: 1, body: "CPUの説明はどれか。", choices: [], tags: ["#CPU"] },
          { _id: "q2", kind: "q", exam_id: id, q_number: 2, body: "OSの説明はどれか。", choices: [], tags: ["#OS"] },
        ]
      : [],
  ),
  listIpExams: vi.fn(async () => [
    { exam_id: "ip-2025r07", exam: "IP", year: "2025", section: "通年", question_count: 1, title: "ITパスポート 2025年 (令和7年)" },
  ]),
  listIpQuestions: vi.fn(async (id: string) =>
    id === "ip-2025r07"
      ? [
          {
            _id: "iq1",
            kind: "q",
            exam_id: id,
            q_number: 1,
            body: "いわゆる偽装請負とみなされる状態はどれか。",
            choices: [],
            tags: ["#法務", "#偽装請負"],
          },
        ]
      : [],
  ),
  listApExams: vi.fn(async () => [
    { exam_id: "ap-2025r07-a", exam: "AP", year: "2025", section: "午前", question_count: 1, title: "令和7年度秋期 応用情報技術者試験 午前" },
  ]),
  listApQuestions: vi.fn(async () => [
    { _id: "apq1", kind: "q", exam_id: "ap-2025r07-a", q_number: 1, body: "監査証跡の説明はどれか。", choices: [], tags: ["#監査"] },
  ]),
  listSgExams: vi.fn(async () => [
    { exam_id: "sg-2025r07-a", exam: "SG", year: "2025", section: "a", question_count: 1 },
  ]),
  listSgQuestions: vi.fn(async () => [
    { _id: "sq1", kind: "q", exam_id: "sg-2025r07-a", q_number: 1, body: "ゼロトラストの説明はどれか。", choices: [], tags: ["#ゼロトラスト"] },
  ]),
  listScExams: vi.fn(async () => [
    { exam_id: "sc-2025r07-a", exam: "SC", year: "2025", section: "午前", question_count: 1, title: "令和7年度秋期 情報処理安全確保支援士試験 午前" },
  ]),
  listScQuestions: vi.fn(async () => [
    { _id: "scq1", kind: "q", exam_id: "sc-2025r07-a", q_number: 1, body: "公開鍵暗号方式の説明はどれか。", choices: [], tags: ["#暗号"] },
  ]),
  listDkExams: vi.fn(async () => []),
  listDkQuestions: vi.fn(async () => []),
}))

vi.mock("@/lib/takken/api", () => ({
  TakkenAPI: {
    listExams: vi.fn(async () => [
      { exam_id: "tk-r5", era: "令和", era_year: 5, exam_month: 10, year: 2023, label: "R5", passing_score: 36, question_count: 50 },
    ]),
    listExamQuestions: vi.fn(async () => ({
      exam_id: "tk-r5",
      count: 2,
      questions: [
        { _id: "tkq1", question_number: 1, category: "宅建業法", format: "simple", question_text: "宅建業法の説明はどれか。", choices: {}, correct_answer: 1, accepted_answers: [1] },
        { _id: "tkq2", question_number: 2, category: "権利関係", format: "simple", question_text: "権利関係の説明はどれか。", choices: {}, correct_answer: 2, accepted_answers: [2] },
      ],
    })),
  },
}))

vi.mock("@/lib/kango/api", () => ({
  listKnExams: vi.fn(async () => [
    { exam_id: "kn-115", title: "第115回", question_count: 10 },
  ]),
  listKnQuestions: vi.fn(async () => [
    { _id: "knq1", exam_id: "kn-115", q_number: 1, body: "看護倫理の説明はどれか。", choices: [], correct: "1" },
  ]),
}))

describe("split sitemaps", () => {
  beforeEach(() => vi.resetModules())
  afterEach(() => vi.clearAllMocks())

  it("emits a sitemap index that points to purpose-specific sitemaps", async () => {
    const { sitemapIndexXml } = await import("@/lib/seo/sitemaps")
    const xml = sitemapIndexXml(new Date("2026-01-01T00:00:00.000Z"))
    expect(xml).toContain("<sitemapindex")
    expect(xml).toContain("https://goukaku.dev/sitemaps/static.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/ip-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/fe-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/sg-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/ap-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/sc-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/denki-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/kango-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/takken-questions.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/glossary.xml")
  })

  it("static sitemap contains major hubs but no app play URLs", async () => {
    const { sitemapEntries } = await import("@/lib/seo/sitemaps")
    const urls = (await sitemapEntries("static")).map((entry) => entry.url)
    expect(urls).toContain("https://goukaku.dev/")
    expect(urls).toContain("https://goukaku.dev/ip/questions")
    expect(urls).toContain("https://goukaku.dev/ip/mock")
    expect(urls).toContain("https://goukaku.dev/denki")
    expect(urls).toContain("https://goukaku.dev/pro")
    expect(urls).toContain("https://goukaku.dev/fe/exam/fe-2023h")
    expect(urls).not.toContain("https://goukaku.dev/fe/exam/ap-2023h")
    expect(urls.some((url) => url.includes("/play/"))).toBe(false)
  })

  it("question sitemaps use canonical /questions URLs", async () => {
    const { sitemapEntries } = await import("@/lib/seo/sitemaps")
    const ip = (await sitemapEntries("ip-questions")).map((entry) => entry.url)
    const fe = (await sitemapEntries("fe-questions")).map((entry) => entry.url)
    const sg = (await sitemapEntries("sg-questions")).map((entry) => entry.url)
    expect(ip).toContain("https://goukaku.dev/ip/questions/2025-r07-q1-gisou-ukeoi")
    expect(fe).toContain("https://goukaku.dev/fe/questions/2023h-q1-cpu")
    expect(sg).toContain("https://goukaku.dev/sg/questions/2025-r07-a-q1-zero-trust")
    expect([...ip, ...fe, ...sg].some((url) => url.includes("/play/"))).toBe(false)
  })

  it("denki question sitemap contains canonical play question URLs", async () => {
    const api = await import("@/lib/api-client")
    vi.mocked(api.listDkExams).mockResolvedValueOnce([
      {
        exam_id: "ee2-20260524",
        exam: "ee2",
        year: "令和8年度",
        section: "上期",
        title: "令和8年度上期 第二種電気工事士 学科試験",
        question_count: 1,
      },
    ])
    vi.mocked(api.listDkQuestions).mockResolvedValueOnce([
      {
        _id: "ee2-20260524-q1",
        kind: "single",
        exam_id: "ee2-20260524",
        q_number: 1,
        body: "端子a-b間の合成抵抗はどれか。",
        choices: [],
      },
    ])

    const { sitemapEntries, urlsetXml } = await import("@/lib/seo/sitemaps")
    const urls = (await sitemapEntries("denki-questions")).map((entry) => entry.url)
    expect(urls).toContain("https://goukaku.dev/denki/play/ee2-20260524/q/1")
    expect(urlsetXml(urls.map((url) => ({ url })))).toContain(
      "https://goukaku.dev/denki/play/ee2-20260524/q/1",
    )
  })

  it("play-based question sitemaps cover AP, SC, Kango, and Takken", async () => {
    const { sitemapEntries, urlsetXml } = await import("@/lib/seo/sitemaps")
    const ap = (await sitemapEntries("ap-questions")).map((entry) => entry.url)
    const sc = (await sitemapEntries("sc-questions")).map((entry) => entry.url)
    const kango = (await sitemapEntries("kango-questions")).map((entry) => entry.url)
    const takken = (await sitemapEntries("takken-questions")).map((entry) => entry.url)

    expect(ap).toContain("https://goukaku.dev/ap/play/ap-2025r07-a/q/1")
    expect(sc).toContain("https://goukaku.dev/sc/play/sc-2025r07-a/q/1")
    expect(kango).toContain("https://goukaku.dev/kango/play/kn-115/q/1")
    // 宅建 quiz は試験回ごとの基底 URL 1 件のみ。?q=N の近重複 URL は登録しない。
    expect(takken).toEqual(["https://goukaku.dev/takken/exams/tk-r5/quiz"])

    const xml = urlsetXml(
      [...ap, ...sc, ...kango, ...takken].map((url) => ({ url })),
    )
    expect(xml).toContain("https://goukaku.dev/ap/play/ap-2025r07-a/q/1")
    expect(xml).toContain("https://goukaku.dev/sc/play/sc-2025r07-a/q/1")
    expect(xml).toContain("https://goukaku.dev/kango/play/kn-115/q/1")
    expect(xml).toContain("https://goukaku.dev/takken/exams/tk-r5/quiz")
    expect(xml).not.toContain("quiz?q=")
  })

  it("urlset renderer rejects legacy takken ?q= URLs", async () => {
    const { urlsetXml } = await import("@/lib/seo/sitemaps")
    const xml = urlsetXml([
      { url: "https://goukaku.dev/takken/exams/tk-r5/quiz" },
      { url: "https://goukaku.dev/takken/exams/tk-r5/quiz?q=2" },
    ])
    expect(xml.match(/<url>/g)).toHaveLength(1)
    expect(xml).not.toContain("?q=")
  })

  it("omits lastmod because real modification dates are unknown", async () => {
    const { sitemapEntries, urlsetXml } = await import("@/lib/seo/sitemaps")
    const names = ["static", "ip-questions", "takken-questions", "glossary"] as const
    for (const name of names) {
      const entries = await sitemapEntries(name)
      expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true)
      expect(urlsetXml(entries)).not.toContain("<lastmod>")
    }
  })

  it("glossary sitemap includes canonical glossary pages with enough study context", async () => {
    const { sitemapEntries } = await import("@/lib/seo/sitemaps")
    const glossary = (await sitemapEntries("glossary")).map((entry) => entry.url)
    expect(glossary).toContain("https://goukaku.dev/glossary/%E5%81%BD%E8%A3%85%E8%AB%8B%E8%B2%A0")
    expect(glossary).toContain("https://goukaku.dev/glossary/2%E7%9B%B8%E3%82%B3%E3%83%9F%E3%83%83%E3%83%88")
  })

  it("glossary sitemap uses hyphenated slugs for reserved-character terms", async () => {
    const { sitemapEntries } = await import("@/lib/seo/sitemaps")
    const glossary = (await sitemapEntries("glossary")).map((entry) => entry.url)
    // %2F は Google 側で / に正規化され 2 セグメント URL の 404 を生むため禁止。
    expect(glossary).toContain("https://goukaku.dev/glossary/S-MIME")
    expect(glossary).toContain("https://goukaku.dev/glossary/JPCERT-CC")
    expect(glossary.some((url) => url.includes("%2F"))).toBe(false)
    expect(glossary.some((url) => url.includes("%20"))).toBe(false)
  })

  it("urlset renderer filters non-indexable URLs and duplicates", async () => {
    const { urlsetXml } = await import("@/lib/seo/sitemaps")
    const xml = urlsetXml([
      { url: "https://goukaku.dev/ip/questions/2025-r07-q1-gisou-ukeoi" },
      { url: "https://goukaku.dev/ip/questions/2025-r07-q1-gisou-ukeoi" },
      { url: "https://goukaku.dev/ip/play/ip-2025r07/q/1" },
      { url: "https://goukaku.dev/takken/search" },
    ])
    expect(xml.match(/<url>/g)).toHaveLength(1)
    expect(xml).toContain("/ip/questions/2025-r07-q1-gisou-ukeoi")
    expect(xml).not.toContain("/ip/play/")
    expect(xml).not.toContain("/takken/search")
  })
})
