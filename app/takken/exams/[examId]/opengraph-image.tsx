import { TakkenAPI } from "@/lib/takken/api"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "宅建 過去問"

export default async function Image({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const exam = await TakkenAPI.getExam(examId)
  const label = exam?.label ?? examId
  const count = exam?.question_count ?? 50
  return renderOgImage({
    title: `${label} 宅建過去問`,
    subtitle: `全${count}問・関連条文/判例ポップアップ表示`,
    badge: "宅建 過去問",
    accent: "charcoal",
  })
}
