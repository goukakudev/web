import { describe, it, expect, beforeEach } from "vitest"
import { getDeviceId, getAnswer, setAnswer, getAllAnswers, resetExamProgress } from "@/lib/local-store"

beforeEach(() => {
  localStorage.clear()
})

describe("getDeviceId", () => {
  it("creates and persists a UUID on first call", () => {
    const id1 = getDeviceId()
    expect(id1).toMatch(/^[0-9a-f-]{36}$/i)
    const id2 = getDeviceId()
    expect(id2).toBe(id1)
  })
})

describe("answers", () => {
  it("stores and retrieves an answer", () => {
    setAnswer({
      question_id: "q1",
      exam_id: "fe-2017",
      selected_label: "ア",
      correct_label: "イ",
      answered_at: "2026-05-17T10:00:00.000Z",
    })
    const rec = getAnswer("q1")
    expect(rec?.selected_label).toBe("ア")
    expect(rec?.correct_label).toBe("イ")
  })

  it("returns undefined when no record", () => {
    expect(getAnswer("missing")).toBeUndefined()
  })

  it("getAllAnswers returns the map of all records", () => {
    setAnswer({ question_id: "q1", exam_id: "fe", selected_label: "ア", correct_label: "ア", answered_at: "t1" })
    setAnswer({ question_id: "q2", exam_id: "fe", selected_label: "イ", correct_label: "ア", answered_at: "t2" })
    const all = getAllAnswers()
    expect(Object.keys(all).sort()).toEqual(["q1", "q2"])
  })

  it("resetExamProgress drops only that exam's answers", () => {
    setAnswer({ question_id: "q1", exam_id: "fe", selected_label: "ア", correct_label: "ア", answered_at: "t1" })
    setAnswer({ question_id: "q2", exam_id: "ap", selected_label: "イ", correct_label: "ア", answered_at: "t2" })
    resetExamProgress("fe")
    expect(getAnswer("q1")).toBeUndefined()
    expect(getAnswer("q2")?.exam_id).toBe("ap")
  })
})
