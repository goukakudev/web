import { listIpExams, listIpQuestions } from "@/lib/api-client"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "IP 過去問 問題"

function stripMd(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default async function Image({
  params,
}: {
  params: Promise<{ examId: string; qNumber: string }>
}) {
  const { examId, qNumber } = await params
  const n = Number(qNumber)
  const [exams, questions] = await Promise.all([
    listIpExams(),
    listIpQuestions(examId).catch(() => []),
  ])
  const exam = exams.find((e) => e.exam_id === examId)
  const q = questions.find((q) => q.q_number === n)
  const label = exam?.title ?? examId
  const preview = q ? stripMd(q.body).slice(0, 80) : ""
  return renderOgImage({
    title: `問${n}`,
    subtitle: preview || label,
    badge: `${label} / IP`,
    accent: "pink",
  })
}
