import type { ExamSummary } from "./types"

const TITLE_PREFIXES = [
  "基本情報技術者試験 ",
  "ITパスポート試験 ",
  "IT パスポート試験 ",
]
const TITLE_SUFFIXES = [" 公開問題", " サンプル問題"]

export function shortTitle(exam: ExamSummary): string {
  if (!exam.title) return exam.exam_id
  let s = exam.title
  for (const prefix of TITLE_PREFIXES) {
    if (s.startsWith(prefix)) {
      s = s.slice(prefix.length)
      break
    }
  }
  for (const suffix of TITLE_SUFFIXES) {
    if (s.endsWith(suffix)) s = s.slice(0, -suffix.length)
  }
  return s
}
