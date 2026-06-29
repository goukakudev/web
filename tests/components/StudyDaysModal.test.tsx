import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { StudyDaysModal } from "@/components/home/StudyDaysModal"

const originalFetch = globalThis.fetch

describe("StudyDaysModal", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("loads wrong answers through browser-safe APIs and links to the right subject", async () => {
    const answeredAt = new Date()
    localStorage.setItem(
      "examquiz.answers.v1",
      JSON.stringify({
        "ap-2025r07h-a-q1": {
          question_id: "ap-2025r07h-a-q1",
          exam_id: "ap-2025r07h-a",
          selected_label: "ア",
          correct_label: "イ",
          answered_at: answeredAt.toISOString(),
        },
      }),
    )

    const requested: string[] = []
    globalThis.fetch = vi.fn(async (url: RequestInfo | URL) => {
      const path = url.toString()
      requested.push(path)

      if (path === "/api/client/ap/exams/ap-2025r07h-a/questions") {
        return new Response(
          JSON.stringify({
            exam_id: "ap-2025r07h-a",
            count: 1,
            questions: [
              {
                _id: "ap-2025r07h-a-q1",
                kind: "single",
                exam_id: "ap-2025r07h-a",
                q_number: 1,
                body: "応用情報の間違えた問題",
                choices: [],
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    render(<StudyDaysModal open onClose={() => {}} />)

    const label = `${answeredAt.getMonth() + 1}月${answeredAt.getDate()}日 の間違えた問題`
    fireEvent.click(screen.getByLabelText(label))

    const link = await screen.findByRole("link", {
      name: /ap-2025r07h-a · Q1/,
    })
    expect(link.getAttribute("href")).toBe("/ap/play/ap-2025r07h-a/q/1")
    expect(await screen.findByText("応用情報の間違えた問題")).toBeTruthy()
    expect(requested).toEqual([
      "/api/client/ap/exams/ap-2025r07h-a/questions",
    ])
  })
})
