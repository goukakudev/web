import type { Question } from "@/lib/types"
import { stripMd } from "@/lib/text-utils"

/**
 * 設問ページの検索インデックス品質ゲート。
 *
 * 公開過去問の本文は他サイトと同一になり得るため、独自解説が十分ある設問
 * だけを index 対象にする。用語集の glossary-quality と同型の判定 API。
 *
 * 閾値根拠 (2026-07 API 全件サンプリング):
 *   - IP  2700 問: overall≥60 && per_choice≥3 && per_total≥80 → 約 98%
 *   - FE  1080 問: 同条件 → 約 53%
 * 厳しすぎる (80/3/120) と FE が ~19% まで落ちるため、独自解説の最低限を
 * 担保しつつ FE も半分以上載せられる水準にしている。
 */

export const MIN_OVERALL_EXPLANATION_LENGTH = 60
export const MIN_PER_CHOICE_COUNT = 3
export const MIN_PER_CHOICE_TOTAL_LENGTH = 80

const STUB_OVERALL_RE =
  /^(解説準備中|準備中|coming\s*soon|TODO|TBD|未作成|未記入)([。．.：:\s]|$)/i

export type QuestionQualityReason =
  | "ok"
  | "no_correct_label"
  | "no_overall"
  | "stub_overall"
  | "short_overall"
  | "few_per_choice"
  | "short_per_choice"

export interface QuestionQuality {
  indexable: boolean
  reason: QuestionQualityReason
  overallLength: number
  perChoiceCount: number
  perChoiceTotalLength: number
}

function charLength(text: string): number {
  return [...text].length
}

function overallText(question: Question): string {
  return stripMd(question.explanation?.overall ?? "").trim()
}

function perChoiceTexts(question: Question): string[] {
  return (question.explanation?.per_choice ?? [])
    .map((choice) => stripMd(choice.text ?? "").trim())
    .filter((text) => text.length > 0)
}

export function questionQuality(question: Question): QuestionQuality {
  const overall = overallText(question)
  const perChoices = perChoiceTexts(question)
  const overallLength = charLength(overall)
  const perChoiceCount = perChoices.length
  const perChoiceTotalLength = perChoices.reduce(
    (sum, text) => sum + charLength(text),
    0,
  )

  const base = {
    overallLength,
    perChoiceCount,
    perChoiceTotalLength,
  }

  if (!question.correct_label) {
    return { ...base, indexable: false, reason: "no_correct_label" }
  }
  if (!overall) {
    return { ...base, indexable: false, reason: "no_overall" }
  }
  if (STUB_OVERALL_RE.test(overall)) {
    return { ...base, indexable: false, reason: "stub_overall" }
  }
  if (overallLength < MIN_OVERALL_EXPLANATION_LENGTH) {
    return { ...base, indexable: false, reason: "short_overall" }
  }
  if (perChoiceCount < MIN_PER_CHOICE_COUNT) {
    return { ...base, indexable: false, reason: "few_per_choice" }
  }
  if (perChoiceTotalLength < MIN_PER_CHOICE_TOTAL_LENGTH) {
    return { ...base, indexable: false, reason: "short_per_choice" }
  }

  return { ...base, indexable: true, reason: "ok" }
}

export function isIndexableQuestion(question: Question): boolean {
  return questionQuality(question).indexable
}
