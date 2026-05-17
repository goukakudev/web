import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { recordAnswer, flushPendingRequests } from "@/lib/client-api"
import { loadPendingRequests } from "@/lib/pending-queue"

const originalFetch = globalThis.fetch

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe("recordAnswer", () => {
  it("POSTs to /api/answers and returns success on 2xx", async () => {
    const captured: { url: string; init: RequestInit } = { url: "", init: {} }
    globalThis.fetch = vi.fn(async (url: RequestInfo, init?: RequestInit) => {
      captured.url = url.toString()
      captured.init = init ?? {}
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }) as typeof fetch

    await recordAnswer({
      device_id: "d1",
      question_id: "q1",
      exam_id: "fe",
      selected_label: "ア",
      correct_label: "イ",
      is_correct: false,
      skipped: false,
      client_ts: "2026-05-17T10:00:00.000Z",
    })

    expect(captured.url).toContain("/api/answers")
    expect((captured.init.headers as Record<string, string>)["Content-Type"]).toBe("application/json")
    expect(JSON.parse(captured.init.body as string).question_id).toBe("q1")
    expect(loadPendingRequests()).toHaveLength(0)
  })

  it("queues the request when fetch throws (offline)", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("Network error")
    }) as typeof fetch

    await recordAnswer({
      device_id: "d1",
      question_id: "q2",
      exam_id: "fe",
      selected_label: "ア",
      correct_label: "ア",
      is_correct: true,
      skipped: false,
      client_ts: "2026-05-17T10:00:00.000Z",
    })

    const queue = loadPendingRequests()
    expect(queue).toHaveLength(1)
    expect(queue[0].path).toBe("/api/answers")
  })

  it("queues on 5xx", async () => {
    globalThis.fetch = vi.fn(async () => new Response("server error", { status: 503 })) as typeof fetch
    await recordAnswer({
      device_id: "d",
      question_id: "q",
      exam_id: "fe",
      selected_label: "ア",
      correct_label: "ア",
      is_correct: true,
      skipped: false,
      client_ts: "t",
    })
    expect(loadPendingRequests()).toHaveLength(1)
  })

  it("does NOT queue on 4xx (server rejected payload)", async () => {
    globalThis.fetch = vi.fn(async () => new Response("bad", { status: 400 })) as typeof fetch
    await recordAnswer({
      device_id: "d",
      question_id: "q",
      exam_id: "fe",
      selected_label: "ア",
      correct_label: "ア",
      is_correct: true,
      skipped: false,
      client_ts: "t",
    })
    expect(loadPendingRequests()).toHaveLength(0)
  })
})

describe("flushPendingRequests", () => {
  it("removes successfully sent items", async () => {
    localStorage.setItem(
      "examquiz.pending.v1",
      JSON.stringify([
        { id: "1", created_at: "t", method: "POST", path: "/api/answers", body: { x: 1 } },
        { id: "2", created_at: "t", method: "POST", path: "/api/feedback", body: { y: 2 } },
      ]),
    )

    globalThis.fetch = vi.fn(async () => new Response("{}", { status: 200 })) as typeof fetch

    await flushPendingRequests()

    expect(loadPendingRequests()).toHaveLength(0)
  })

  it("stops on transport error and keeps remaining items", async () => {
    localStorage.setItem(
      "examquiz.pending.v1",
      JSON.stringify([
        { id: "1", created_at: "t", method: "POST", path: "/api/answers", body: { x: 1 } },
        { id: "2", created_at: "t", method: "POST", path: "/api/feedback", body: { y: 2 } },
      ]),
    )

    globalThis.fetch = vi.fn(async () => {
      throw new Error("offline")
    }) as typeof fetch

    await flushPendingRequests()

    expect(loadPendingRequests()).toHaveLength(2)
  })

  it("drops 4xx items", async () => {
    localStorage.setItem(
      "examquiz.pending.v1",
      JSON.stringify([
        { id: "1", created_at: "t", method: "POST", path: "/api/answers", body: { x: 1 } },
      ]),
    )

    globalThis.fetch = vi.fn(async () => new Response("bad", { status: 400 })) as typeof fetch

    await flushPendingRequests()

    expect(loadPendingRequests()).toHaveLength(0)
  })
})
