import { describe, expect, it, beforeEach, afterEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { QuestionListView } from "@/components/play/QuestionListView"

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(() => "/denki/history"),
}))

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}))

const originalFetch = globalThis.fetch

describe("QuestionListView", () => {
  beforeEach(() => {
    localStorage.clear()
    usePathnameMock.mockReturnValue("/denki/history")
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("loads denki history through browser-safe API routes", async () => {
    localStorage.setItem(
      "examquiz.answers.v1",
      JSON.stringify({
        "ee2-20260524-q1": {
          question_id: "ee2-20260524-q1",
          exam_id: "ee2-20260524",
          selected_label: "ア",
          correct_label: "ア",
          answered_at: "2026-06-24T08:00:00.000Z",
        },
      }),
    )

    const requested: string[] = []
    globalThis.fetch = vi.fn(async (url: RequestInfo | URL) => {
      const path = url.toString()
      requested.push(path)

      if (path === "/api/client/dk/exams") {
        return new Response(
          JSON.stringify({
            exams: [
              {
                exam_id: "ee2-20260524",
                exam: "ee2",
                year: "令和8年度",
                section: "上期",
                title: "令和8年度上期 第二種電気工事士 学科試験",
                question_count: 50,
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        )
      }

      if (path === "/api/client/dk/exams/ee2-20260524/questions") {
        return new Response(
          JSON.stringify({
            exam_id: "ee2-20260524",
            count: 1,
            questions: [
              {
                _id: "ee2-20260524-q1",
                kind: "single",
                exam_id: "ee2-20260524",
                q_number: 1,
                body: "電気工事士の履歴テスト問題",
                choices: [],
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    render(<QuestionListView mode="history" subject="dk" basePath="/denki" variant="denki" />)

    expect(await screen.findByText("電気工事士の履歴テスト問題")).toBeInTheDocument()
    expect(screen.queryByText("読み込みに失敗しました。通信を確認してください。")).toBeNull()
    expect(requested).toEqual([
      "/api/client/dk/exams",
      "/api/client/dk/exams/ee2-20260524/questions",
    ])
  })
})
