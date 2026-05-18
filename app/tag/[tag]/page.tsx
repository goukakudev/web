import type { Metadata } from "next"
import { listExams, listQuestions } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { TagQuestionRow } from "@/components/tag/TagQuestionRow"
import Link from "next/link"
import type { Question, ExamSummary } from "@/lib/types"

interface PageProps {
  params: Promise<{ tag: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: tagParam } = await params
  const tag = decodeURIComponent(tagParam)
  const title = `#${tag} の過去問`
  const description = `基本情報技術者試験の過去問のうち「${tag}」タグが付いた問題の一覧。解説付き。`
  const canonical = `/tag/${encodeURIComponent(tag)}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", title, description, url: canonical },
    twitter: { card: "summary", title, description },
  }
}

export default async function TagPage({ params }: PageProps) {
  const { tag: tagParam } = await params
  const tag = decodeURIComponent(tagParam)

  const exams = await listExams()
  const examsById = new Map<string, ExamSummary>(exams.map((e) => [e.exam_id, e]))

  const collected: Question[] = []
  for (const exam of exams) {
    try {
      const qs = await listQuestions(exam.exam_id)
      for (const q of qs) {
        if ((q.tags ?? []).includes(tag)) collected.push(q)
      }
    } catch {
      // ignore individual exam fetch errors — show what we have
    }
  }
  collected.sort((a, b) => {
    if (a.exam_id !== b.exam_id) return a.exam_id < b.exam_id ? -1 : 1
    return a.q_number - b.q_number
  })

  return (
    <MobileFrame>
      <Link href="/" className="inline-block text-[14px] mb-4">← ホーム</Link>
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center bg-goukaku-cool/35 text-[#1a8acb] text-[13px] font-extrabold px-2.5 py-1.5 rounded-xl">
          #{tag}
        </span>
        <span className="text-[12px] font-extrabold text-goukaku-ink/55">
          {collected.length} 問
        </span>
      </div>
      {collected.length === 0 ? (
        <p className="text-[13px] text-goukaku-ink/55 mt-6 text-center">
          該当する問題がありません
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {collected.map((q) => (
            <TagQuestionRow
              key={q._id}
              question={q}
              exam={examsById.get(q.exam_id)}
            />
          ))}
        </div>
      )}
    </MobileFrame>
  )
}
