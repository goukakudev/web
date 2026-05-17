import { notFound } from "next/navigation"
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

  const questions = await listQuestions(examId)
  const playMode: "sequential" | "random" = mode === "random" ? "random" : "sequential"

  return (
    <MobileFrame>
      <PlayController questions={questions} exam={exam} mode={playMode} />
    </MobileFrame>
  )
}
