import type { ExamSummary } from "./types"

const TITLE_PREFIX = "基本情報技術者試験 "
const TITLE_SUFFIXES = [" 公開問題", " サンプル問題"]

export function shortTitle(exam: ExamSummary): string {
  if (!exam.title) return exam.exam_id
  let s = exam.title
  if (s.startsWith(TITLE_PREFIX)) s = s.slice(TITLE_PREFIX.length)
  for (const suffix of TITLE_SUFFIXES) {
    if (s.endsWith(suffix)) s = s.slice(0, -suffix.length)
  }
  return s
}
