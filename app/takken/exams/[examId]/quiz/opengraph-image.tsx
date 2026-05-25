import { TakkenAPI } from "@/lib/takken/api"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "宅建 過去問 演習"

export default async function Image({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const exam = await TakkenAPI.getExam(examId)
  const label = exam?.label ?? examId
  return renderOgImage({
    title: `${label} 宅建 演習`,
    subtitle: `全${exam?.question_count ?? 50}問を順番に解く`,
    badge: "宅建 / 演習",
    accent: "charcoal",
  })
}
