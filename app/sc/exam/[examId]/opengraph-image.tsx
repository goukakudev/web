import { listScExams } from "@/lib/api-client"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "SC 過去問"

export default async function Image({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const exams = await listScExams()
  const exam = exams.find((e) => e.exam_id === examId)
  const label =
    exam?.title ?? `${exam?.year ?? ""} ${exam?.section ?? ""}`.trim()
  const count = exam?.question_count ?? 25
  return renderOgImage({
    title: label || examId,
    subtitle: `情報処理安全確保支援士試験 全${count}問・解説/ヒント付き`,
    badge: "SC 過去問",
    accent: "charcoal",
  })
}
