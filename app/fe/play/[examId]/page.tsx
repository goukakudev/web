import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { listExams, listQuestions, getExamStats } from "@/lib/api-client"
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

export default async function FePlayPage({ params, searchParams }: PageProps) {
  const { examId } = await params
  const { mode } = await searchParams

  const exams = await listExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  if (mode === undefined || mode === "sequential") {
    const questions = await listQuestions(examId)
    const first = [...questions].sort((a, b) => a.q_number - b.q_number)[0]
    if (first) redirect(`/fe/play/${examId}/q/${first.q_number}`)
  }

  const [questions, statsMap] = await Promise.all([
    listQuestions(examId),
    getExamStats(examId),
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
        stats={stats}
      />
    </MobileFrame>
  )
}
