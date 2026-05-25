import {
  listExams,
  listQuestions,
  getExamStats,
} from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"
import type { Question, ExamSummary, QuestionStat } from "@/lib/types"

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

export default async function FePlayRandomPage({ searchParams }: PageProps) {
  const { count } = await searchParams
  const limit = Math.max(1, Math.min(100, Number(count ?? 20) || 20))

  const exams = await listExams()
  const questionLists = await Promise.all(
    exams.map((e) => listQuestions(e.exam_id).catch(() => [] as Question[])),
  )
  const all: Question[] = questionLists.flat()
  // Fisher-Yates shuffle for a per-request random sample.
  const shuffled = [...all]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const seed = shuffled.slice(0, limit)
  const examIdsInSeed = Array.from(new Set(seed.map((q) => q.exam_id)))
  const statsResults = await Promise.all(
    examIdsInSeed.map((examId) => getExamStats(examId)),
  )
  // Only keep stats for the seeded questions to keep the RSC payload tight.
  const seedIds = new Set(seed.map((q) => q._id))
  const stats: Record<string, QuestionStat> = {}
  for (const map of statsResults) {
    for (const [qid, stat] of map) {
      if (seedIds.has(qid)) stats[qid] = stat
    }
  }

  return (
    <MobileFrame>
      <PlayController
        questions={seed}
        exam={VIRTUAL_EXAM}
        mode="random"
        stats={stats}
      />
    </MobileFrame>
  )
}
