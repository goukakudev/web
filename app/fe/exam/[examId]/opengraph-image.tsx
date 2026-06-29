import { listFeExams } from "@/lib/api-client"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "FE 過去問"

export default async function Image({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const exams = await listFeExams()
  const exam = exams.find((e) => e.exam_id === examId)
  const label =
    exam?.title ?? `${exam?.year ?? ""} ${exam?.section ?? ""}`.trim()
  const count = exam?.question_count ?? 80
  return renderOgImage({
    title: label || examId,
    subtitle: `基本情報技術者試験 午前 全${count}問・解説付き`,
    badge: "FE 過去問",
    accent: "blue",
  })
}
