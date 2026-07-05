import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listKnQuestions, getKnExam } from "@/lib/kango/api"
import { displayTitle } from "@/lib/kango/exam"
import { KangoQuiz } from "@/components/kango/KangoQuiz"

export const revalidate = 86400

// このページは横スワイプで全問を切り替えるインタラクティブな演習アプリ（URL は examId 固定）。
// 個別問題の検索インデックス用 URL は /kango/play/[examId]/q/[qNumber]（SSR の静的ページ）に分離した。
// よってこのアプリ URL は noindex,follow にして重複インデックスを避けつつ、内部リンクは辿らせる。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ examId: string }>
}): Promise<Metadata> {
  const { examId } = await params
  const exam = await getKnExam(examId).catch(() => undefined)
  const t = exam ? displayTitle(exam) : "看護師国家試験"
  return {
    title: `${t} 演習`,
    description: `${t}を1問ずつ演習します。`,
    robots: { index: false, follow: true },
  }
}

// クイズページ: 試験の全問を取得し、KangoQuiz(クライアント) に渡す。
// ?mode=random&n=20 でランダム出題 (client で全問シャッフル→n件)。?start=NN で開始位置。
export default async function KangoPlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>
  searchParams: Promise<{ mode?: string; n?: string; start?: string; qid?: string }>
}) {
  const { examId } = await params
  const sp = await searchParams
  const [questions, exam] = await Promise.all([
    listKnQuestions(examId).catch(() => []),
    getKnExam(examId),
  ])
  if (!questions.length) notFound()

  const random = sp.mode === "random"
  const n = Math.max(1, parseInt(sp.n ?? "20", 10) || 20)
  let startIndex = Math.max(0, parseInt(sp.start ?? "0", 10) || 0)
  // ?qid=<_id> で特定問題から開始 (カテゴリ/タグページからの遷移用)
  if (sp.qid) {
    const i = questions.findIndex((q) => q._id === sp.qid)
    if (i >= 0) startIndex = i
  }

  return (
    <KangoQuiz
      questions={questions}
      exam={exam ?? null}
      title={random ? "ランダム出題" : exam ? displayTitle(exam) : "問題を解く"}
      backHref="/kango"
      startIndex={random ? 0 : startIndex}
      shuffle={random}
      limit={random ? n : undefined}
    />
  )
}
