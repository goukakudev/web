import type { ExamSummary } from "@/lib/types"

export type YearSubject = "fe" | "ip"

export interface YearSummaryData {
  yearKey: string
  yearDisplay: string
  exams: ExamSummary[]
  totalQuestions: number
  prevYear?: string
  nextYear?: string
}

/**
 * Group exams by `year` field. The year field comes from the API as a string;
 * we treat it opaquely (could be "2023", "令和5", "平成27" etc).
 */
export function groupExamsByYear(exams: ExamSummary[]): Map<string, ExamSummary[]> {
  const byYear = new Map<string, ExamSummary[]>()
  for (const e of exams) {
    const k = e.year || "unknown"
    const list = byYear.get(k) ?? []
    list.push(e)
    byYear.set(k, list)
  }
  for (const [, list] of byYear) {
    list.sort((a, b) => (a.section ?? "").localeCompare(b.section ?? ""))
  }
  return byYear
}

/**
 * Sort years lexicographically descending — works for 4-digit Western years
 * AND for "令和N"/"平成N" since those sort within their era prefix.
 */
export function sortYearsDesc(years: string[]): string[] {
  return [...years].sort((a, b) => (a < b ? 1 : -1))
}

export function buildYearSummary({
  yearKey,
  exams,
  allYearsDesc,
}: {
  yearKey: string
  exams: ExamSummary[]
  allYearsDesc: string[]
}): YearSummaryData {
  const idx = allYearsDesc.indexOf(yearKey)
  const prevYear = idx > 0 ? allYearsDesc[idx - 1] : undefined
  const nextYear = idx >= 0 && idx < allYearsDesc.length - 1 ? allYearsDesc[idx + 1] : undefined
  const totalQuestions = exams.reduce((s, e) => s + (e.question_count ?? 0), 0)
  return {
    yearKey,
    yearDisplay: yearKey,
    exams,
    totalQuestions,
    prevYear,
    nextYear,
  }
}

export function buildYearIntro({
  subject,
  yearDisplay,
  examCount,
  totalQuestions,
}: {
  subject: YearSubject
  yearDisplay: string
  examCount: number
  totalQuestions: number
}): string {
  const full = subject === "fe" ? "基本情報技術者試験" : "ITパスポート試験"
  return (
    `${full} ${yearDisplay} の過去問演習ページです。` +
    `${yearDisplay}に実施された ${examCount} 回の試験(全 ${totalQuestions} 問)を一覧で確認できます。` +
    `年度内の試験回ごとの出題内訳や、関連年度へのナビゲーションから ${full}の出題傾向を俯瞰できます。`
  )
}
