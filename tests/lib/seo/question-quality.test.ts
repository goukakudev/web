import { describe, expect, it } from "vitest"
import {
  isIndexableQuestion,
  questionQuality,
  MIN_OVERALL_EXPLANATION_LENGTH,
  MIN_PER_CHOICE_COUNT,
  MIN_PER_CHOICE_TOTAL_LENGTH,
} from "@/lib/seo/question-quality"
import type { Question } from "@/lib/types"

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    _id: "q1",
    kind: "mcq",
    exam_id: "ip-2025r07",
    q_number: 1,
    body: "問題文です。",
    choices: [
      { label: "ア", text: "選択肢ア" },
      { label: "イ", text: "選択肢イ" },
      { label: "ウ", text: "選択肢ウ" },
      { label: "エ", text: "選択肢エ" },
    ],
    correct_label: "ア",
    explanation: {
      overall: "あ".repeat(MIN_OVERALL_EXPLANATION_LENGTH),
      per_choice: [
        { label: "ア", text: "い".repeat(30) },
        { label: "イ", text: "う".repeat(30) },
        { label: "ウ", text: "え".repeat(30) },
        { label: "エ", text: "お".repeat(30) },
      ],
    },
    ...overrides,
  }
}

describe("questionQuality", () => {
  it("indexes questions with enough overall and per-choice explanation", () => {
    const result = questionQuality(makeQuestion())
    expect(result.indexable).toBe(true)
    expect(result.reason).toBe("ok")
    expect(isIndexableQuestion(makeQuestion())).toBe(true)
  })

  it("rejects missing correct label", () => {
    const result = questionQuality(
      makeQuestion({ correct_label: undefined }),
    )
    expect(result.indexable).toBe(false)
    expect(result.reason).toBe("no_correct_label")
  })

  it("rejects missing overall explanation", () => {
    const result = questionQuality(
      makeQuestion({ explanation: { overall: "", per_choice: [] } }),
    )
    expect(result.indexable).toBe(false)
    expect(result.reason).toBe("no_overall")
  })

  it("rejects stub overall explanations", () => {
    for (const overall of ["解説準備中", "準備中。", "TODO: 書く", "coming soon"]) {
      const result = questionQuality(
        makeQuestion({
          explanation: {
            overall,
            per_choice: [
              { label: "ア", text: "い".repeat(30) },
              { label: "イ", text: "う".repeat(30) },
              { label: "ウ", text: "え".repeat(30) },
            ],
          },
        }),
      )
      expect(result.indexable, overall).toBe(false)
      expect(result.reason, overall).toBe("stub_overall")
    }
  })

  it("rejects short overall explanations", () => {
    const result = questionQuality(
      makeQuestion({
        explanation: {
          overall: "あ".repeat(MIN_OVERALL_EXPLANATION_LENGTH - 1),
          per_choice: [
            { label: "ア", text: "い".repeat(30) },
            { label: "イ", text: "う".repeat(30) },
            { label: "ウ", text: "え".repeat(30) },
          ],
        },
      }),
    )
    expect(result.indexable).toBe(false)
    expect(result.reason).toBe("short_overall")
  })

  it("rejects fewer than the minimum per-choice explanations", () => {
    const result = questionQuality(
      makeQuestion({
        explanation: {
          overall: "あ".repeat(MIN_OVERALL_EXPLANATION_LENGTH),
          per_choice: Array.from({ length: MIN_PER_CHOICE_COUNT - 1 }, (_, i) => ({
            label: (["ア", "イ", "ウ", "エ"] as const)[i],
            text: "い".repeat(40),
          })),
        },
      }),
    )
    expect(result.indexable).toBe(false)
    expect(result.reason).toBe("few_per_choice")
  })

  it("rejects short total per-choice text", () => {
    const perText = "あ".repeat(
      Math.floor((MIN_PER_CHOICE_TOTAL_LENGTH - 1) / MIN_PER_CHOICE_COUNT),
    )
    const result = questionQuality(
      makeQuestion({
        explanation: {
          overall: "あ".repeat(MIN_OVERALL_EXPLANATION_LENGTH),
          per_choice: Array.from({ length: MIN_PER_CHOICE_COUNT }, (_, i) => ({
            label: (["ア", "イ", "ウ", "エ"] as const)[i],
            text: perText,
          })),
        },
      }),
    )
    expect(result.indexable).toBe(false)
    expect(result.reason).toBe("short_per_choice")
  })

  it("strips markdown before measuring length", () => {
    // stripMd 後に閾値を満たす本文だけが残るケース
    const overall =
      "$x=1$ " + "解".repeat(MIN_OVERALL_EXPLANATION_LENGTH)
    const result = questionQuality(
      makeQuestion({
        explanation: {
          overall,
          per_choice: [
            { label: "ア", text: "い".repeat(30) },
            { label: "イ", text: "う".repeat(30) },
            { label: "ウ", text: "え".repeat(30) },
          ],
        },
      }),
    )
    expect(result.indexable).toBe(true)
    expect(result.overallLength).toBeGreaterThanOrEqual(
      MIN_OVERALL_EXPLANATION_LENGTH,
    )
  })
})
