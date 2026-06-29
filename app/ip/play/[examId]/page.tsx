import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import {
  listIpExams,
  listIpQuestions,
  getIpExamStats,
} from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"
import type { QuestionStat } from "@/lib/types"
import { makeMetadata } from "@/lib/seo/metadata"

interface PageProps {
  params: Promise<{ examId: string }>
  searchParams: Promise<{ mode?: string }>
}

function playModeLabel(mode?: string): string {
  if (mode === "random") return "ランダム演習"
  if (mode === "wrongOnly") return "復習演習"
  if (mode === undefined || mode === "sequential") return "問題演習"
  return "模試"
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { examId } = await params
  const { mode } = await searchParams
  const label = playModeLabel(mode)

  try {
    const exams = await listIpExams()
    const exam = exams.find((e) => e.exam_id === examId)
    const examLabel = exam?.title ?? examId

    return makeMetadata({
      title: `ITパスポート試験 ${examLabel} ${label}`,
      description: `ITパスポート試験 ${examLabel} の${label}ページです。解説・選択肢別解説・ヒント付きで演習できます。`,
      path: `/ip/play/${examId}`,
      noindex: true,
    })
  } catch {
    return { robots: { index: false, follow: true } }
  }
}

export default async function IpPlayPage({ params, searchParams }: PageProps) {
  const { examId } = await params
  const { mode } = await searchParams

  const [exams, questions, statsMap] = await Promise.all([
    listIpExams(),
    listIpQuestions(examId),
    getIpExamStats(examId),
  ])
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  if (mode === undefined || mode === "sequential") {
    const first = [...questions].sort((a, b) => a.q_number - b.q_number)[0]
    if (first) redirect(`/ip/play/${examId}/q/${first.q_number}`)
  }
  // Filter stats to question_ids in this exam; upstream may include
  // pollution that blows up the client RSC payload.
  const knownIds = new Set(questions.map((qq) => qq._id))
  const stats: Record<string, QuestionStat> = {}
  for (const [qid, stat] of statsMap) {
    if (knownIds.has(qid)) stats[qid] = stat
  }
  const playMode: "random" | "wrongOnly" | "exam" =
    mode === "random" ? "random" :
    mode === "wrongOnly" ? "wrongOnly" :
    "exam"
  const label = playModeLabel(playMode)

  return (
    <MobileFrame>
      <h1 className="sr-only">
        ITパスポート試験 {exam.title ?? exam.exam_id} {label}
      </h1>
      <PlayController
        questions={questions}
        exam={exam}
        mode={playMode}
        urlBase="/ip/play"
        homeHref="/ip"
        stats={stats}
      />
    </MobileFrame>
  )
}
