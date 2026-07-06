import type { Metadata } from "next"
import {
  listDkExams,
  listDkQuestions,
  getDkExamStats,
} from "@/lib/api-client"
import { DenkiStudyFrame } from "@/components/denki/DenkiFrame"
import { PlayController } from "@/components/play/PlayController"
import { shuffledCopy } from "@/lib/server-random"
import type { Question, ExamSummary, QuestionStat } from "@/lib/types"

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

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
  const shuffledExams = shuffledCopy(exams)
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
  const shuffled = shuffledCopy(all)
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
    <DenkiStudyFrame>
      <PlayController
        questions={seed}
        exam={{ ...VIRTUAL_EXAM, question_count: seed.length }}
        mode="random"
        urlBase="/denki/play"
        homeHref="/denki"
        stats={stats}
        variant="denki"
      />
    </DenkiStudyFrame>
  )
}
