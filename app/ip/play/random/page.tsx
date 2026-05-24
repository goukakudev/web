import {
  listIpExams,
  listIpQuestions,
  getIpExamStats,
} from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"
import type { Question, ExamSummary, QuestionStat } from "@/lib/types"

const VIRTUAL_EXAM: ExamSummary = {
  exam_id: "ip-ALL",
  exam: "IP",
  year: "",
  section: "",
  title: "ITパスポート 全試験ランダム 20問",
  question_count: 20,
}

interface PageProps {
  searchParams: Promise<{ count?: string }>
}

export default async function IpPlayRandomPage({ searchParams }: PageProps) {
  const { count } = await searchParams
  const limit = Math.max(1, Math.min(100, Number(count ?? 20) || 20))

  const exams = await listIpExams()
  const all: Question[] = []
  for (const exam of exams) {
    try {
      const qs = await listIpQuestions(exam.exam_id)
      all.push(...qs)
    } catch {
      // ignore individual exam fetch errors
    }
  }
  const seed = all.slice().sort((a, b) => a._id.localeCompare(b._id)).slice(0, limit)
  const examIdsInSeed = Array.from(new Set(seed.map((q) => q.exam_id)))
  const statsResults = await Promise.all(
    examIdsInSeed.map((examId) => getIpExamStats(examId)),
  )
  const stats: Record<string, QuestionStat> = {}
  for (const map of statsResults) {
    for (const [qid, stat] of map) {
      stats[qid] = stat
    }
  }

  return (
    <MobileFrame>
      <PlayController
        questions={seed}
        exam={VIRTUAL_EXAM}
        mode="random"
        urlBase="/ip/play"
        homeHref="/ip"
        stats={stats}
      />
    </MobileFrame>
  )
}
