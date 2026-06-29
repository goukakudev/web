import { describe, expect, it } from "vitest"
import type { ExamSummary, Question } from "@/lib/types"
import { relatedQuestionLinks } from "@/lib/seo/question-related"

const exam: ExamSummary = {
  exam_id: "ip-2025r07",
  exam: "IP",
  year: "2025",
  section: "r07",
  title: "ITパスポート 2025年 (令和7年)",
  question_count: 4,
}

function q(
  qNumber: number,
  body: string,
  tags: string[],
): Question {
  return {
    _id: `q${qNumber}`,
    kind: "q",
    exam_id: exam.exam_id,
    q_number: qNumber,
    body,
    choices: [],
    tags,
  }
}

describe("relatedQuestionLinks", () => {
  it("prioritizes specific term matches over broad field matches", () => {
    const current = q(1, "偽装請負とみなされる状態はどれか。", ["#ストラテジ系", "#偽装請負"])
    const sameField = q(2, "財務諸表の説明はどれか。", ["#ストラテジ系"])
    const sameTerm = q(3, "請負契約と偽装請負の違いはどれか。", ["#ストラテジ系", "#偽装請負"])
    const links = relatedQuestionLinks("ip", exam, current, [current, sameField, sameTerm])
    expect(links[0]).toMatchObject({
      question: sameTerm,
      reason: "same_term",
      label: "同じ用語: 偽装請負",
    })
    expect(links[1]).toMatchObject({
      question: sameField,
      reason: "same_field",
    })
  })
})
