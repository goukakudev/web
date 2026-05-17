import { notFound } from "next/navigation"
import { listExams } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { ModeButton } from "@/components/exam/ModeButton"
import Link from "next/link"

export async function generateStaticParams() {
  const exams = await listExams()
  return exams.map((e) => ({ examId: e.exam_id }))
}

interface PageProps {
  params: Promise<{ examId: string }>
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { examId } = await params
  const exams = await listExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  const base = `/play/${exam.exam_id}`
  return (
    <MobileFrame>
      <Link href="/" className="inline-block text-[14px] mb-4">← ホーム</Link>
      <div className="text-[10px] tracking-[1.2px] font-bold text-goukaku-ink/50 uppercase">
        {exam.exam_id}
      </div>
      <h1 className="text-[20px] font-extrabold mb-6">{exam.title ?? exam.exam_id}</h1>
      <div className="flex flex-col gap-3">
        <ModeButton href={`${base}?mode=sequential`} icon="📋" label="順番に解く" subtitle={`${exam.question_count} 問`} />
        <ModeButton href={`${base}?mode=random`} icon="🔀" label="ランダムに解く" />
        <ModeButton href={`${base}?mode=exam`} icon="⏱" label="模試 (150 分)" emphasized />
      </div>
    </MobileFrame>
  )
}
