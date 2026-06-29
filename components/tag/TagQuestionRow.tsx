import Link from "next/link"
import type { Question, ExamSummary } from "@/lib/types"

function bodyPreview(s: string): string {
  const collapsed = s.replace(/\n/g, " ")
  return collapsed.length > 90 ? collapsed.slice(0, 90) + "…" : collapsed
}

export function TagQuestionRow({
  question,
  exam,
  subject = "fe",
  playBase,
  variant = "default",
}: {
  question: Question
  exam: ExamSummary | undefined
  subject?: "fe" | "ip" | "ap" | "sg" | "sc" | "dk"
  playBase?: string
  variant?: "default" | "denki"
}) {
  const examLabel = exam?.title ?? question.exam_id
  const playHref = `${playBase ?? `/${subject}/play`}/${question.exam_id}/q/${question.q_number}`
  const cardCls =
    variant === "denki"
      ? "block rounded-lg border border-[#d8d1bc] bg-[#fffdf6] p-3.5 transition hover:border-[#191815] hover:shadow-[3px_3px_0_#191815]"
      : "block bg-goukaku-surface rounded-2xl p-3.5 border border-goukaku-divider"
  const qCls =
    variant === "denki"
      ? "text-[11px] font-black text-[#007c83]"
      : "text-[11px] font-extrabold text-goukaku-pink-script"
  return (
    <Link
      href={playHref}
      className={cardCls}
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-extrabold text-goukaku-ink/55">{examLabel}</span>
        <span className={qCls}>Q{question.q_number}</span>
        <span className="ml-auto text-[11px] text-goukaku-ink/35">›</span>
      </div>
      <div className="text-[13px] leading-[1.5] mt-2 line-clamp-3">
        {bodyPreview(question.body)}
      </div>
    </Link>
  )
}
