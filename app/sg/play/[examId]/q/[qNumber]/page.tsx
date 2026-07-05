import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  listSgExams,
  listSgQuestions,
  getSgExamStats,
} from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { PlayController } from "@/components/play/PlayController"
import type { QuestionStat } from "@/lib/types"
import { makeMetadata } from "@/lib/seo/metadata"
import { questionJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { QuestionSeoExtras } from "@/components/seo/QuestionSeoExtras"
import { RelatedQuestions } from "@/components/seo/RelatedQuestions"
import { QuestionLearningResources } from "@/components/seo/QuestionLearningResources"
import { QuizBottomActions } from "@/components/play/QuizBottomActions"
import { stripMd } from "@/lib/text-utils"
import {
  questionCanonicalPath,
  questionSeoDescription,
  questionSeoTitle,
} from "@/lib/seo/question-url"

interface PageProps {
  params: Promise<{ examId: string; qNumber: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { examId, qNumber } = await params
  const n = Number(qNumber)
  if (!Number.isInteger(n) || n < 1) return {}

  try {
    const [exams, questions] = await Promise.all([
      listSgExams(),
      listSgQuestions(examId),
    ])
    const exam = exams.find((e) => e.exam_id === examId)
    const q = questions.find((q) => q.q_number === n)
    if (!exam || !q) return {}

    const title = questionSeoTitle("sg", exam, q)
    const description = questionSeoDescription("sg", exam, q)
    const canonical = questionCanonicalPath("sg", exam, q)

    return makeMetadata({ title, description, path: canonical, type: "article" })
  } catch {
    return {}
  }
}

export default async function SgPlayQuestionPage({ params }: PageProps) {
  const { examId, qNumber } = await params
  const n = Number(qNumber)
  if (!Number.isInteger(n) || n < 1) notFound()

  const [exams, questions, statsMap] = await Promise.all([
    listSgExams(),
    listSgQuestions(examId).catch(() => []),
    getSgExamStats(examId),
  ])
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()
  // Filter stats to question_ids in this exam; upstream may include
  // pollution that blows up the client RSC payload + Worker CPU.
  const knownIds = new Set(questions.map((qq) => qq._id))
  const stats: Record<string, QuestionStat> = {}
  for (const [qid, stat] of statsMap) {
    if (knownIds.has(qid)) stats[qid] = stat
  }
  const q = questions.find((q) => q.q_number === n)
  if (!q) notFound()

  // Slim non-current questions for the client component; only the current
  // question needs full body/choices/explanation/hint/figures for display.
  // Other entries only need _id, q_number, body, tags for navigation +
  // related-questions rendering. Cuts RSC payload by ~60-70%.
  const slimQuestions = questions.map((qq) =>
    qq._id === q._id
      ? qq
      : {
          _id: qq._id,
          kind: qq.kind,
          exam_id: qq.exam_id,
          q_number: qq.q_number,
          body: "",
          choices: [],
        },
  )

  const canonicalPath = questionCanonicalPath("sg", exam, q)
  const url = `${SITE_URL}${canonicalPath}`
  const examLabel = exam.title ?? exam.exam_id
  const examUrl = `/sg/exam/${exam.exam_id}`

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報セキュリティマネジメント試験", href: "/sg" },
        { name: examLabel, href: examUrl },
        { name: `問${n}`, href: `/sg/play/${exam.exam_id}/q/${n}` },
      ]} />
      <JsonLd
        data={questionJsonLd({
          name: `${examLabel} 問${n}`,
          text: stripMd(q.body),
          url,
          choices: q.choices.map((c) => ({ label: c.label, text: c.text })),
          correctLabel: q.correct_label,
          explanation: q.explanation?.overall,
          partOfName: `${examLabel} 過去問`,
          partOfUrl: `${SITE_URL}/sg/exam/${exam.exam_id}`,
        })}
      />
      <h1 className="sr-only">
        情報セキュリティマネジメント試験 {examLabel} 問{n}: {stripMd(q.body).slice(0, 80)}
      </h1>
      <PlayController
        questions={slimQuestions}
        exam={exam}
        mode="sequential"
        initialQNumber={n}
        urlBase="/sg/play"
        homeHref="/sg"
        stats={stats}
      />
      <QuestionSeoExtras
        subjectName="情報セキュリティマネジメント試験"
        examLabel={examLabel}
        qNumber={n}
        body={q.body}
        choices={q.choices}
        correctLabel={q.correct_label}
        explanation={q.explanation}
        examUrl={examUrl}
        stat={stats[q._id]}
        tags={q.tags}
      />
      <RelatedQuestions
        current={{ q_number: n, tags: q.tags }}
        examQuestions={questions}
        basePath={`/sg/play/${exam.exam_id}/q`}
        examLabel={examLabel}
      />
      <QuestionLearningResources examKey="sg" />
      <QuizBottomActions examKey="sg" />
    </MobileFrame>
  )
}
