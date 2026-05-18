import { notFound, redirect } from "next/navigation"
import { listExams, listQuestions } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"

interface PageProps {
  params: Promise<{ examId: string }>
  searchParams: Promise<{ mode?: string }>
}

export default async function PlayPage({ params, searchParams }: PageProps) {
  const { examId } = await params
  const { mode } = await searchParams

  const exams = await listExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  // sequential (and bare /play/[examId]) → canonical per-question URL
  if (mode === undefined || mode === "sequential") {
    const questions = await listQuestions(examId)
    const first = [...questions].sort((a, b) => a.q_number - b.q_number)[0]
    if (first) redirect(`/play/${examId}/q/${first.q_number}`)
  }

  const questions = await listQuestions(examId)
  const playMode: "random" | "wrongOnly" | "exam" =
    mode === "random" ? "random" :
    mode === "wrongOnly" ? "wrongOnly" :
    "exam"

  return (
    <MobileFrame>
      <PlayController questions={questions} exam={exam} mode={playMode} />
    </MobileFrame>
  )
}
