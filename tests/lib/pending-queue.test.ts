import { describe, it, expect, beforeEach } from "vitest"
import {
  enqueueRequest,
  loadPendingRequests,
  removePendingRequest,
} from "@/lib/pending-queue"

beforeEach(() => {
  localStorage.clear()
})

describe("pending-queue", () => {
  it("starts empty", () => {
    expect(loadPendingRequests()).toEqual([])
  })

  it("enqueues a request with id + createdAt + path + body", () => {
    enqueueRequest({ method: "POST", path: "/v1/answers", body: { foo: "bar" } })
    const items = loadPendingRequests()
    expect(items).toHaveLength(1)
    expect(items[0].method).toBe("POST")
    expect(items[0].path).toBe("/v1/answers")
    expect(items[0].body).toEqual({ foo: "bar" })
    expect(items[0].id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(typeof items[0].created_at).toBe("string")
  })

  it("appends across calls", () => {
    enqueueRequest({ method: "POST", path: "/v1/answers", body: { a: 1 } })
    enqueueRequest({ method: "POST", path: "/v1/feedback", body: { b: 2 } })
    const items = loadPendingRequests()
    expect(items).toHaveLength(2)
  })

  it("removes by id", () => {
    enqueueRequest({ method: "POST", path: "/v1/answers", body: { a: 1 } })
    enqueueRequest({ method: "POST", path: "/v1/feedback", body: { b: 2 } })
    const first = loadPendingRequests()[0]
    removePendingRequest(first.id)
    const after = loadPendingRequests()
    expect(after).toHaveLength(1)
    expect(after[0].path).toBe("/v1/feedback")
  })

  it("survives JSON parse failure with empty array", () => {
    localStorage.setItem("examquiz.pending.v1", "{not json")
    expect(loadPendingRequests()).toEqual([])
  })
})
