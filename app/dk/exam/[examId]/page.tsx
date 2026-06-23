import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listDkExams, listDkQuestions } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { ModeButton } from "@/components/exam/ModeButton"
import { makeMetadata } from "@/lib/seo/metadata"
import { learningResourceJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { ExamDetailExtras } from "@/components/seo/ExamDetailExtras"
import { buildExamIntro } from "@/lib/seo/exam-intro"

export async function generateStaticParams() {
  const exams = await listDkExams()
  return exams.map((e) => ({ examId: e.exam_id }))
}

interface PageProps {
  params: Promise<{ examId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId } = await params
  const exams = await listDkExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) return {}

  const examLabel = exam.title ?? `${exam.year} ${exam.section}`
  const title = `${examLabel} 過去問 ${exam.question_count} 問`
  const description = `第二種電気工事士 学科試験 ${examLabel} の過去問 ${exam.question_count} 問。順番・ランダム・模試 (120 分) の 3 モードで解け、図入り問題・解説・ヒント付き。`
  const canonical = `/dk/exam/${exam.exam_id}`

  return makeMetadata({ title, description, path: canonical })
}

export default async function DkExamDetailPage({ params }: PageProps) {
  const { examId } = await params
  const [exams, questions] = await Promise.all([
    listDkExams(),
    listDkQuestions(examId).catch(() => []),
  ])
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  const base = `/dk/play/${exam.exam_id}`
  const examLabel = exam.title ?? `${exam.year} ${exam.section}`
  const intro = buildExamIntro({ exam, subject: "dk" })

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "第二種電気工事士", href: "/dk" },
        { name: examLabel, href: `/dk/exam/${exam.exam_id}` },
      ]} />
      <JsonLd
        data={learningResourceJsonLd({
          name: `${examLabel} 過去問`,
          description: `第二種電気工事士 学科試験 ${examLabel} の過去問 ${exam.question_count} 問・解説・ヒント付き`,
          url: `${SITE_URL}/dk/exam/${exam.exam_id}`,
          numberOfItems: exam.question_count,
          aboutName: "第二種電気工事士 学科試験",
        })}
      />
      <div className="text-[10px] tracking-[1.2px] font-bold text-goukaku-ink/50 uppercase">
        {exam.exam_id}
      </div>
      <h1 className="text-[20px] font-extrabold mb-6">{examLabel}</h1>
      <div className="flex flex-col gap-3">
        <ModeButton href={`${base}/q/1`} icon="📋" label="順番に解く" subtitle={`${exam.question_count} 問`} />
        <ModeButton href={`${base}?mode=random`} icon="🔀" label="ランダムに解く" />
        <ModeButton href={`${base}?mode=exam`} icon="⏱" label="模試 (120 分)" emphasized />
      </div>
      <ExamDetailExtras
        intro={intro}
        questions={questions}
        playBase={`${base}/q`}
        tagBase="/dk/tag"
        parentLabel="第二種電気工事士"
        parentHref="/dk"
        examLabel={examLabel}
      />
    </MobileFrame>
  )
}
