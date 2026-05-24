import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import {
  listIpExams,
  listIpQuestions,
  getIpExamStats,
} from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"
import type { QuestionStat } from "@/lib/types"

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

interface PageProps {
  params: Promise<{ examId: string }>
  searchParams: Promise<{ mode?: string }>
}

export default async function IpPlayPage({ params, searchParams }: PageProps) {
  const { examId } = await params
  const { mode } = await searchParams

  const exams = await listIpExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  if (mode === undefined || mode === "sequential") {
    const questions = await listIpQuestions(examId)
    const first = [...questions].sort((a, b) => a.q_number - b.q_number)[0]
    if (first) redirect(`/ip/play/${examId}/q/${first.q_number}`)
  }

  const [questions, statsMap] = await Promise.all([
    listIpQuestions(examId),
    getIpExamStats(examId),
  ])
  const stats: Record<string, QuestionStat> = Object.fromEntries(statsMap)
  const playMode: "random" | "wrongOnly" | "exam" =
    mode === "random" ? "random" :
    mode === "wrongOnly" ? "wrongOnly" :
    "exam"

  return (
    <MobileFrame>
      <PlayController
        questions={questions}
        exam={exam}
        mode={playMode}
        urlBase="/ip/play"
        homeHref="/ip"
        stats={stats}
      />
    </MobileFrame>
  )
}
