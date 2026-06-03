import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"
import { getKnExam } from "@/lib/kango/api"
import { displayTitle } from "@/lib/kango/exam"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "看護師国家試験 過去問 — 合格.dev"

export default async function Image({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const exam = await getKnExam(examId).catch(() => undefined)
  return renderOgImage({
    title: exam ? displayTitle(exam) : "看護師国家試験 過去問",
    subtitle: exam ? `全${exam.question_count}問 / 選択肢別解説つき` : "選択肢別解説つき・無料",
    badge: "看護",
    accent: "blue",
  })
}
