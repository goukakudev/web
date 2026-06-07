import type { ExamSummary } from "@/lib/types"

export type YearSubject = "fe" | "ip" | "ap" | "sg" | "sc"

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

/** Pretty-print a yearKey: "2013h25h" → "2013年(平成25年度 春期)" etc. */
export function prettyYear(key: string): string {
  // First 4 digits = western year.
  const yMatch = key.match(/^(\d{4})/)
  const western = yMatch ? yMatch[1] : key
  let era = ""
  const eraMatch = key.match(/(\d{4})([hr])(\d{2})/)
  if (eraMatch) {
    const ePrefix = eraMatch[2] === "h" ? "平成" : "令和"
    era = `${ePrefix}${parseInt(eraMatch[3], 10)}年度`
  }
  let season = ""
  if (/h$/i.test(key) && eraMatch) season = "春期"
  else if (/a$/i.test(key) && eraMatch) season = "秋期"
  const parts = [`${western}年`]
  if (era) parts.push(`(${era}${season ? ` ${season}` : ""})`)
  return parts.join("")
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
    yearDisplay: prettyYear(yearKey),
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
  const full =
    subject === "fe"
      ? "基本情報技術者試験"
      : subject === "ap"
        ? "応用情報技術者試験"
        : subject === "sg"
          ? "情報セキュリティマネジメント試験"
          : subject === "sc"
            ? "情報処理安全確保支援士試験"
            : "ITパスポート試験"
  return (
    `${full} ${yearDisplay} の過去問演習ページです。` +
    `${yearDisplay}に実施された ${examCount} 回の試験(全 ${totalQuestions} 問)を一覧で確認できます。` +
    `年度内の試験回ごとの出題内訳や、関連年度へのナビゲーションから ${full}の出題傾向を俯瞰できます。`
  )
}
