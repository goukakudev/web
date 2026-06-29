import type { Metadata } from "next"
import {
  listIpExams,
  listIpQuestions,
  getIpExamStats,
} from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"
import { shuffledCopy } from "@/lib/server-random"
import type { Question, ExamSummary, QuestionStat } from "@/lib/types"
import { makeMetadata } from "@/lib/seo/metadata"

const VIRTUAL_EXAM: ExamSummary = {
  exam_id: "ip-ALL",
  exam: "IP",
  year: "",
  section: "",
  title: "ITパスポート 全試験ランダム",
  question_count: 20,
}

interface PageProps {
  searchParams: Promise<{ count?: string }>
}

function parseRandomCount(count?: string): number {
  return Math.max(1, Math.min(100, Number(count ?? 20) || 20))
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { count } = await searchParams
  const limit = parseRandomCount(count)

  return makeMetadata({
    title: `ITパスポート試験 ランダム${limit}問`,
    description: `ITパスポート試験の過去問からランダムに${limit}問を出題します。解説・選択肢別解説・ヒント付きで演習できます。`,
    path: "/ip/play/random",
    noindex: true,
  })
}

export default async function IpPlayRandomPage({ searchParams }: PageProps) {
  const { count } = await searchParams
  const limit = parseRandomCount(count)

  const exams = await listIpExams()
  // Pick exams in random order until we have ~3× the requested count in the
  // candidate pool. Avoids fetching every exam just to throw 95% away.
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
      listIpQuestions(e.exam_id).catch(() => [] as Question[]),
    ),
  )
  const all: Question[] = questionLists.flat()
  // Fisher-Yates shuffle for a per-request random sample.
  const shuffled = shuffledCopy(all)
  const seed = shuffled.slice(0, limit)
  const examIdsInSeed = Array.from(new Set(seed.map((q) => q.exam_id)))
  const statsResults = await Promise.all(
    examIdsInSeed.map((examId) => getIpExamStats(examId)),
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
      <h1 className="sr-only">ITパスポート試験 ランダム{seed.length}問</h1>
      <PlayController
        questions={seed}
        exam={{
          ...VIRTUAL_EXAM,
          title: `ITパスポート 全試験ランダム ${seed.length}問`,
          question_count: seed.length,
        }}
        mode="random"
        urlBase="/ip/play"
        homeHref="/ip"
        stats={stats}
      />
    </MobileFrame>
  )
}
