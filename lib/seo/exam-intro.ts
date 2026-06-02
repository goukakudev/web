import type { ExamSummary } from "@/lib/types"

export interface ExamIntroInput {
  exam: ExamSummary
  subject: "fe" | "ip" | "ap" | "sg"
}

const SUBJECT_META = {
  fe: {
    fullName: "基本情報技術者試験",
    sessionLabel: "午前",
    modes: "順番に解く / ランダム出題 / 90 分模試",
    features: "全問の解説、選択肢ごとの正誤判定、分野タグ",
  },
  ip: {
    fullName: "ITパスポート試験",
    sessionLabel: "",
    modes: "順番に解く / ランダム出題 / 120 分模試",
    features: "全問の解説、選択肢ごとの正誤判定、ヒント、分野タグ",
  },
  ap: {
    fullName: "応用情報技術者試験",
    sessionLabel: "午前",
    modes: "順番に解く / ランダム出題 / 150 分模試",
    features: "全問の解説、選択肢ごとの正誤判定、ヒント、分野タグ",
  },
  sg: {
    fullName: "情報セキュリティマネジメント試験",
    sessionLabel: "科目A",
    modes: "順番に解く / ランダム出題 / 90 分模試",
    features: "全問の解説、選択肢ごとの正誤判定、ヒント、分野タグ",
  },
} as const

export function buildExamIntro({ exam, subject }: ExamIntroInput): string {
  const meta = SUBJECT_META[subject]
  const examLabel = exam.title ?? `${exam.year} ${exam.section}`
  const session = meta.sessionLabel ? ` ${meta.sessionLabel}` : ""
  return (
    `${meta.fullName} ${examLabel}${session} の過去問演習ページです。` +
    `本ページから全 ${exam.question_count} 問を、${meta.modes} の 3 モードで解けます。` +
    `${meta.features}が付いており、独学でも公式解説と同等の理解度で過去問を回せます。` +
    `分野別の出題内訳は下記の「出題分野の内訳」を参照してください。`
  )
}
