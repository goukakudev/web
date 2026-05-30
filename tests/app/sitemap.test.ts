import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/api-client", () => ({
  listExams: vi.fn(async () => [
    { exam_id: "fe-2023h", exam: "FE", year: "2023", section: "春期", question_count: 80 },
  ]),
  listQuestions: vi.fn(async (id: string) =>
    id === "fe-2023h"
      ? [
          { _id: "q1", kind: "q", exam_id: id, q_number: 1, body: "x", choices: [], tags: ["#CPU"] },
          { _id: "q2", kind: "q", exam_id: id, q_number: 2, body: "x", choices: [], tags: ["#OS", "#CPU"] },
        ]
      : [],
  ),
  listIpExams: vi.fn(async () => [
    { exam_id: "ip-r5", exam: "IP", year: "2023", section: "通年", question_count: 100 },
  ]),
  listIpQuestions: vi.fn(async (id: string) =>
    id === "ip-r5"
      ? [{ _id: "iq1", kind: "q", exam_id: id, q_number: 1, body: "x", choices: [] }]
      : [],
  ),
}))

vi.mock("@/lib/takken/api", () => ({
  TakkenAPI: {
    listExams: vi.fn(async () => [
      { exam_id: "tk-r5", era: "令和", era_year: 5, exam_month: 10, year: 2023, label: "R5", passing_score: 36, question_count: 50 },
    ]),
    listExamQuestions: vi.fn(async (id: string) =>
      id === "tk-r5"
        ? {
            exam_id: id,
            count: 2,
            questions: [
              { _id: "tq1", question_number: 1, category: "宅建業法", format: "simple", question_text: "x", choices: { 1: "a", 2: "b", 3: "c", 4: "d" }, correct_answer: 1, accepted_answers: [1] },
              { _id: "tq2", question_number: 2, category: "宅建業法", format: "simple", question_text: "y", choices: { 1: "a", 2: "b", 3: "c", 4: "d" }, correct_answer: 1, accepted_answers: [1] },
            ],
          }
        : null,
    ),
  },
}))

describe("sitemap (unified)", () => {
  beforeEach(() => vi.resetModules())
  afterEach(() => vi.clearAllMocks())

  it("contains site root, section landings, and policy pages", async () => {
    const mod = await import("@/app/sitemap")
    const urls = (await mod.default()).map((e) => e.url)
    expect(urls).toContain("https://goukaku.dev/")
    expect(urls).toContain("https://goukaku.dev/fe")
    expect(urls).toContain("https://goukaku.dev/ip")
    expect(urls).toContain("https://goukaku.dev/takken")
    expect(urls).toContain("https://goukaku.dev/about")
  })

  it("contains FE exam, question, and tag URLs", async () => {
    const mod = await import("@/app/sitemap")
    const urls = (await mod.default()).map((e) => e.url)
    expect(urls).toContain("https://goukaku.dev/fe/exam/fe-2023h")
    expect(urls).toContain("https://goukaku.dev/fe/play/fe-2023h/q/1")
    expect(urls).toContain("https://goukaku.dev/fe/play/fe-2023h/q/2")
    expect(urls.some((u) => u.startsWith("https://goukaku.dev/fe/tag/"))).toBe(true)
  })

  it("contains IP URLs", async () => {
    const mod = await import("@/app/sitemap")
    const urls = (await mod.default()).map((e) => e.url)
    expect(urls).toContain("https://goukaku.dev/ip/exam/ip-r5")
    expect(urls).toContain("https://goukaku.dev/ip/play/ip-r5/q/1")
  })

  it("contains takken URLs", async () => {
    const mod = await import("@/app/sitemap")
    const urls = (await mod.default()).map((e) => e.url)
    expect(urls).toContain("https://goukaku.dev/takken")
    expect(urls).toContain("https://goukaku.dev/takken/exams/tk-r5")
    // q=1 is excluded — its canonical strips the query, so it would be
    // submitted as duplicate of the bare quiz URL.
    expect(urls).not.toContain("https://goukaku.dev/takken/exams/tk-r5/quiz?q=1")
    expect(urls).toContain("https://goukaku.dev/takken/exams/tk-r5/quiz?q=2")
  })

  it("returns an array", async () => {
    const mod = await import("@/app/sitemap")
    const list = await mod.default()
    expect(Array.isArray(list)).toBe(true)
  })
})
