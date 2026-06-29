import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import {
  listDkExams,
  listDkQuestions,
  getDkExamStats,
} from "@/lib/api-client"
import { DenkiStudyFrame } from "@/components/denki/DenkiFrame"
import { PlayController } from "@/components/play/PlayController"
import type { QuestionStat } from "@/lib/types"

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

interface PageProps {
  params: Promise<{ examId: string }>
  searchParams: Promise<{ mode?: string }>
}

export default async function DkPlayPage({ params, searchParams }: PageProps) {
  const { examId } = await params
  const { mode } = await searchParams

  const [exams, questions, statsMap] = await Promise.all([
    listDkExams(),
    listDkQuestions(examId),
    getDkExamStats(examId),
  ])
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  if (mode === undefined || mode === "sequential") {
    const first = [...questions].sort((a, b) => a.q_number - b.q_number)[0]
    if (first) redirect(`/denki/play/${examId}/q/${first.q_number}`)
  }
  const knownIds = new Set(questions.map((qq) => qq._id))
  const stats: Record<string, QuestionStat> = {}
  for (const [qid, stat] of statsMap) {
    if (knownIds.has(qid)) stats[qid] = stat
  }
  const playMode: "random" | "wrongOnly" | "exam" =
    mode === "random" ? "random" :
    mode === "wrongOnly" ? "wrongOnly" :
    "exam"

  return (
    <DenkiStudyFrame>
      <PlayController
        questions={questions}
        exam={exam}
        mode={playMode}
        urlBase="/denki/play"
        homeHref="/denki"
        stats={stats}
        variant="denki"
      />
    </DenkiStudyFrame>
  )
}
