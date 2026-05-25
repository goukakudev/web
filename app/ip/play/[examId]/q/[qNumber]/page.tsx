import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  listIpExams,
  listIpQuestions,
  getIpExamStats,
} from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"
import type { QuestionStat } from "@/lib/types"
import { makeMetadata } from "@/lib/seo/metadata"
import { questionJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

interface PageProps {
  params: Promise<{ examId: string; qNumber: string }>
}

function stripMd(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { examId, qNumber } = await params
  const n = Number(qNumber)
  if (!Number.isInteger(n) || n < 1) return {}

  try {
    const [exams, questions] = await Promise.all([
      listIpExams(),
      listIpQuestions(examId),
    ])
    const exam = exams.find((e) => e.exam_id === examId)
    const q = questions.find((q) => q.q_number === n)
    if (!exam || !q) return {}

    const examLabel = exam.title ?? `${exam.year} ${exam.section}`
    const bodyPreview = stripMd(q.body).slice(0, 90)
    const title = `${examLabel} 問${n}：${bodyPreview}`
    const description = `ITパスポート試験 ${examLabel} 問${n} の問題本文・選択肢・正解・解説・ヒント。${bodyPreview}…`
    const canonical = `/ip/play/${exam.exam_id}/q/${n}`

    return makeMetadata({ title, description, path: canonical, type: "article" })
  } catch {
    return {}
  }
}

export default async function IpPlayQuestionPage({ params }: PageProps) {
  const { examId, qNumber } = await params
  const n = Number(qNumber)
  if (!Number.isInteger(n) || n < 1) notFound()

  const exams = await listIpExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  const [questions, statsMap] = await Promise.all([
    listIpQuestions(examId),
    getIpExamStats(examId),
  ])
  const stats: Record<string, QuestionStat> = Object.fromEntries(statsMap)
  const q = questions.find((q) => q.q_number === n)
  if (!q) notFound()

  const url = `${SITE_URL}/ip/play/${exam.exam_id}/q/${n}`

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "ITパスポート試験", href: "/ip" },
        { name: exam.title ?? exam.exam_id, href: `/ip/exam/${exam.exam_id}` },
        { name: `問${n}`, href: `/ip/play/${exam.exam_id}/q/${n}` },
      ]} />
      <JsonLd
        data={questionJsonLd({
          name: `${exam.title ?? exam.exam_id} 問${n}`,
          text: stripMd(q.body),
          url,
          choices: q.choices.map((c) => ({ label: c.label, text: c.text })),
          correctLabel: q.correct_label,
          explanation: q.explanation?.overall,
          partOfName: `${exam.title ?? exam.exam_id} 過去問`,
          partOfUrl: `${SITE_URL}/ip/exam/${exam.exam_id}`,
        })}
      />
      <PlayController
        questions={questions}
        exam={exam}
        mode="sequential"
        initialQNumber={n}
        urlBase="/ip/play"
        homeHref="/ip"
        stats={stats}
      />
    </MobileFrame>
  )
}
