import {
  listDkExams,
  listDkQuestions,
  getDkExamStats,
} from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"
import type { Question, ExamSummary, QuestionStat } from "@/lib/types"

const VIRTUAL_EXAM: ExamSummary = {
  exam_id: "ee2-ALL",
  exam: "DK",
  year: "",
  section: "",
  title: "第二種電気工事士 全試験ランダム 20問",
  question_count: 20,
}

interface PageProps {
  searchParams: Promise<{ count?: string }>
}

export default async function DkPlayRandomPage({ searchParams }: PageProps) {
  const { count } = await searchParams
  const limit = Math.max(1, Math.min(100, Number(count ?? 20) || 20))

  const exams = await listDkExams()
  const shuffledExams = [...exams]
  for (let i = shuffledExams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledExams[i], shuffledExams[j]] = [shuffledExams[j], shuffledExams[i]]
  }
  const targetPoolSize = limit * 3
  const selectedExams: typeof exams = []
  let pool = 0
  for (const e of shuffledExams) {
    selectedExams.push(e)
    pool += e.question_count
    if (pool >= targetPoolSize) break
  }
  const questionLists = await Promise.all(
    selectedExams.map((e) =>
      listDkQuestions(e.exam_id).catch(() => [] as Question[]),
    ),
  )
  const all: Question[] = questionLists.flat()
  const shuffled = [...all]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const seed = shuffled.slice(0, limit)
  const examIdsInSeed = Array.from(new Set(seed.map((q) => q.exam_id)))
  const statsResults = await Promise.all(
    examIdsInSeed.map((examId) => getDkExamStats(examId)),
  )
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
        exam={{ ...VIRTUAL_EXAM, question_count: seed.length }}
        mode="random"
        urlBase="/dk/play"
        homeHref="/dk"
        stats={stats}
      />
    </MobileFrame>
  )
}
