import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listIpExams } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { ModeButton } from "@/components/exam/ModeButton"
import Link from "next/link"
import { makeMetadata } from "@/lib/seo/metadata"
import { learningResourceJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

export async function generateStaticParams() {
  const exams = await listIpExams()
  return exams.map((e) => ({ examId: e.exam_id }))
}

interface PageProps {
  params: Promise<{ examId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId } = await params
  const exams = await listIpExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) return {}

  const examLabel = exam.title ?? `${exam.year} ${exam.section}`
  const title = `${examLabel} 過去問 ${exam.question_count} 問`
  const description = `ITパスポート試験 ${examLabel} の過去問 ${exam.question_count} 問。順番・ランダム・模試 (120 分) の 3 モードで解け、全問に解説と選択肢ごとの正誤解説・ヒント付き。`
  const canonical = `/ip/exam/${exam.exam_id}`

  return makeMetadata({ title, description, path: canonical })
}

export default async function IpExamDetailPage({ params }: PageProps) {
  const { examId } = await params
  const exams = await listIpExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  const base = `/ip/play/${exam.exam_id}`
  const examLabel = exam.title ?? `${exam.year} ${exam.section}`

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "ITパスポート試験", href: "/ip" },
        { name: examLabel, href: `/ip/exam/${exam.exam_id}` },
      ]} />
      <JsonLd
        data={learningResourceJsonLd({
          name: `${examLabel} 過去問`,
          description: `ITパスポート試験 ${examLabel} の過去問 ${exam.question_count} 問・解説・ヒント付き`,
          url: `${SITE_URL}/ip/exam/${exam.exam_id}`,
          numberOfItems: exam.question_count,
          aboutName: "ITパスポート試験",
        })}
      />
      <Link href="/ip" className="inline-block text-[14px] mb-4">← ホーム</Link>
      <div className="text-[10px] tracking-[1.2px] font-bold text-goukaku-ink/50 uppercase">
        {exam.exam_id}
      </div>
      <h1 className="text-[20px] font-extrabold mb-6">{exam.title ?? exam.exam_id}</h1>
      <div className="flex flex-col gap-3">
        <ModeButton href={`${base}/q/1`} icon="📋" label="順番に解く" subtitle={`${exam.question_count} 問`} />
        <ModeButton href={`${base}?mode=random`} icon="🔀" label="ランダムに解く" />
        <ModeButton href={`${base}?mode=exam`} icon="⏱" label="模試 (120 分)" emphasized />
      </div>
    </MobileFrame>
  )
}
