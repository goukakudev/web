import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { listExams, listFeExams, listQuestions } from "@/lib/api-client"

const originalFetch = globalThis.fetch
const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env.API_BASE = "https://api.test.local"
  process.env.API_KEY = "test-key"
})

afterEach(() => {
  globalThis.fetch = originalFetch
  process.env = { ...ORIGINAL_ENV }
})

describe("listExams", () => {
  it("sends X-API-Key header and returns parsed exams", async () => {
    const captured: { url: string; init: RequestInit } = { url: "", init: {} }
    globalThis.fetch = vi.fn(async (url: RequestInfo, init?: RequestInit) => {
      captured.url = url.toString()
      captured.init = init ?? {}
      return new Response(
        JSON.stringify({ exams: [{ exam_id: "fe-2017", exam: "fe", year: "2017", section: "a", title: "FE", question_count: 80 }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      )
    }) as typeof fetch

    const exams = await listExams()

    expect(captured.url).toBe("https://api.test.local/v1/exams")
    expect((captured.init.headers as Record<string, string>)["X-API-Key"]).toBe("test-key")
    expect(exams).toHaveLength(1)
    expect(exams[0].exam_id).toBe("fe-2017")
  })

  it("throws when API returns non-2xx", async () => {
    globalThis.fetch = vi.fn(async () => new Response("nope", { status: 500 })) as typeof fetch
    await expect(listExams()).rejects.toThrow(/500/)
  })
})

describe("listFeExams", () => {
  it("filters mixed API results to FE exam IDs only", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          exams: [
            { exam_id: "fe-2025r07-a", exam: "fe", year: "2025", section: "a", question_count: 20 },
            { exam_id: "ap-2025r07h-a", exam: "ap", year: "2025", section: "a", question_count: 80 },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ) as typeof fetch

    const exams = await listFeExams()

    expect(exams.map((exam) => exam.exam_id)).toEqual(["fe-2025r07-a"])
  })
})

describe("listQuestions", () => {
  it("encodes examId and parses questions", async () => {
    const captured: { url: string } = { url: "" }
    globalThis.fetch = vi.fn(async (url: RequestInfo) => {
      captured.url = url.toString()
      return new Response(
        JSON.stringify({
          exam_id: "fe-2017",
          count: 1,
          questions: [
            { _id: "q1", kind: "single", exam_id: "fe-2017", q_number: 1, body: "test", choices: [] },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      )
    }) as typeof fetch

    const qs = await listQuestions("fe-2017")

    expect(captured.url).toBe("https://api.test.local/v1/exams/fe-2017/questions")
    expect(qs).toHaveLength(1)
    expect(qs[0]._id).toBe("q1")
  })
})
