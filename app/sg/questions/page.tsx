import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { QuestionIndexPage } from "@/components/seo/QuestionIndexPage"
import { listSgExams, listSgQuestions } from "@/lib/api-client"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "情報セキュリティマネジメント試験 過去問解説一覧",
  description:
    "情報セキュリティマネジメント試験の公開過去問を、問題ごとの解説ページで確認できます。正解、選択肢別解説、関連用語リンク付き。",
  path: "/sg/questions",
})

export default async function SgQuestionsPage() {
  const exams = await listSgExams()
  const visibleExams = exams.slice(0, 8)
  const questionLists = await Promise.all(
    visibleExams.map((exam) => listSgQuestions(exam.exam_id)),
  )
  return (
    <MobileFrame>
      <QuestionIndexPage
        subject="sg"
        groups={visibleExams.map((exam, index) => ({
          exam,
          questions: questionLists[index],
        }))}
        totalQuestions={exams.reduce((sum, exam) => sum + exam.question_count, 0)}
      />
    </MobileFrame>
  )
}
