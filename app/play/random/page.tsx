import { listExams, listQuestions } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"
import type { Question, ExamSummary } from "@/lib/types"

const VIRTUAL_EXAM: ExamSummary = {
  exam_id: "ALL",
  exam: "ALL",
  year: "",
  section: "",
  title: "全試験ランダム 20問",
  question_count: 20,
}

interface PageProps {
  searchParams: Promise<{ count?: string }>
}

export default async function PlayRandomPage({ searchParams }: PageProps) {
  const { count } = await searchParams
  const limit = Math.max(1, Math.min(100, Number(count ?? 20) || 20))

  const exams = await listExams()
  const all: Question[] = []
  for (const exam of exams) {
    try {
      const qs = await listQuestions(exam.exam_id)
      all.push(...qs)
    } catch {
      // ignore individual exam fetch errors
    }
  }
  // Deterministic seed on server (client re-shuffles in PlayController useEffect)
  const seed = all.slice().sort((a, b) => a._id.localeCompare(b._id)).slice(0, limit)

  return (
    <MobileFrame>
      <PlayController questions={seed} exam={VIRTUAL_EXAM} mode="random" />
    </MobileFrame>
  )
}
