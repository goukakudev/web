import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { QuestionIndexPage } from "@/components/seo/QuestionIndexPage"
import { listIpExams, listIpQuestions } from "@/lib/api-client"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート 過去問解説一覧",
  description:
    "ITパスポート試験の過去問を、問題ごとの解説ページで確認できます。問題文、選択肢、正解、選択肢別解説、関連用語リンク付き。",
  path: "/ip/questions",
})

export default async function IpQuestionsPage() {
  const exams = await listIpExams()
  // 直近回の設問プレビューは 12 回分。全回は allExams でハブリンクを張る。
  const visibleExams = exams.slice(0, 12)
  const questionLists = await Promise.all(
    visibleExams.map((exam) => listIpQuestions(exam.exam_id)),
  )
  return (
    <MobileFrame>
      <QuestionIndexPage
        subject="ip"
        groups={visibleExams.map((exam, index) => ({
          exam,
          questions: questionLists[index],
        }))}
        allExams={exams}
        totalQuestions={exams.reduce((sum, exam) => sum + exam.question_count, 0)}
      />
    </MobileFrame>
  )
}
