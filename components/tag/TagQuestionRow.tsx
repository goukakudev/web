import Link from "next/link"
import type { Question, ExamSummary } from "@/lib/types"

function bodyPreview(s: string): string {
  const collapsed = s.replace(/\n/g, " ")
  return collapsed.length > 90 ? collapsed.slice(0, 90) + "…" : collapsed
}

export function TagQuestionRow({
  question,
  exam,
}: {
  question: Question
  exam: ExamSummary | undefined
}) {
  const examLabel = exam?.title ?? question.exam_id
  return (
    <Link
      href={`/exam/${question.exam_id}/q/${question.q_number}`}
      className="block bg-goukaku-surface rounded-2xl p-3.5 border border-goukaku-divider"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-extrabold text-goukaku-ink/55">{examLabel}</span>
        <span className="text-[11px] font-extrabold text-goukaku-pink-script">Q{question.q_number}</span>
        <span className="ml-auto text-[11px] text-goukaku-ink/35">›</span>
      </div>
      <div className="text-[13px] leading-[1.5] mt-2 line-clamp-3">
        {bodyPreview(question.body)}
      </div>
    </Link>
  )
}
