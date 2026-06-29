import { listFeExams, listQuestions } from "@/lib/api-client"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"
import { stripMd } from "@/lib/text-utils"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "FE 過去問 問題"

export default async function Image({
  params,
}: {
  params: Promise<{ examId: string; qNumber: string }>
}) {
  const { examId, qNumber } = await params
  const n = Number(qNumber)
  const exams = await listFeExams()
  const exam = exams.find((e) => e.exam_id === examId)
  const questions = exam ? await listQuestions(examId).catch(() => []) : []
  const q = questions.find((q) => q.q_number === n)
  const label = exam?.title ?? examId
  const preview = q ? stripMd(q.body).slice(0, 80) : ""
  return renderOgImage({
    title: `問${n}`,
    subtitle: preview || label,
    badge: `${label} / FE`,
    accent: "blue",
  })
}
