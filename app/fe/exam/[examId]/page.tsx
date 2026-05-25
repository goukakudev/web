import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listExams } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { ModeButton } from "@/components/exam/ModeButton"
import Link from "next/link"
import { makeMetadata } from "@/lib/seo/metadata"
import { learningResourceJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

export async function generateStaticParams() {
  const exams = await listExams()
  return exams.map((e) => ({ examId: e.exam_id }))
}

interface PageProps {
  params: Promise<{ examId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId } = await params
  const exams = await listExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) return {}

  const examLabel = exam.title ?? `${exam.year} ${exam.section}`
  const title = `${examLabel} ${exam.exam} 過去問 ${exam.question_count} 問`
  const description = `基本情報技術者試験 ${examLabel} 午前の過去問 ${exam.question_count} 問。順番・ランダム・模試 (90 分) の 3 モードで解け、全問に解説と選択肢ごとの正誤解説が付きます。`
  const canonical = `/fe/exam/${exam.exam_id}`

  return makeMetadata({ title, description, path: canonical })
}

export default async function FeExamDetailPage({ params }: PageProps) {
  const { examId } = await params
  const exams = await listExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  const base = `/fe/play/${exam.exam_id}`
  const examLabel = exam.title ?? `${exam.year} ${exam.section}`

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "基本情報技術者試験", href: "/fe" },
        { name: examLabel, href: `/fe/exam/${exam.exam_id}` },
      ]} />
      <JsonLd
        data={learningResourceJsonLd({
          name: `${examLabel} ${exam.exam} 過去問`,
          description: `基本情報技術者試験 ${examLabel} 午前の過去問 ${exam.question_count} 問・解説付き`,
          url: `${SITE_URL}/fe/exam/${exam.exam_id}`,
          numberOfItems: exam.question_count,
          aboutName: "基本情報技術者試験",
        })}
      />
      <Link href="/fe" className="inline-block text-[14px] mb-4">← ホーム</Link>
      <div className="text-[10px] tracking-[1.2px] font-bold text-goukaku-ink/50 uppercase">
        {exam.exam_id}
      </div>
      <h1 className="text-[20px] font-extrabold mb-6">{exam.title ?? exam.exam_id}</h1>
      <div className="flex flex-col gap-3">
        <ModeButton href={`${base}/q/1`} icon="📋" label="順番に解く" subtitle={`${exam.question_count} 問`} />
        <ModeButton href={`${base}?mode=random`} icon="🔀" label="ランダムに解く" />
        <ModeButton href={`${base}?mode=exam`} icon="⏱" label="模試 (90 分)" emphasized />
      </div>
    </MobileFrame>
  )
}
