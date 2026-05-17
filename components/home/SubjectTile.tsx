import Link from "next/link"
import type { ExamSummary } from "@/lib/types"

const TILE_COLORS = [
  "bg-goukaku-lime",
  "bg-goukaku-pink",
  "bg-goukaku-cool",
  "bg-goukaku-purple",
] as const

function shortTitle(exam: ExamSummary): string {
  if (!exam.title) return exam.exam_id
  let s = exam.title
  const prefix = "基本情報技術者試験 "
  if (s.startsWith(prefix)) s = s.slice(prefix.length)
  for (const suffix of [" 公開問題", " サンプル問題"]) {
    if (s.endsWith(suffix)) s = s.slice(0, -suffix.length)
  }
  return s
}

export function SubjectTile({ exam, index }: { exam: ExamSummary; index: number }) {
  const color = TILE_COLORS[index % TILE_COLORS.length]
  return (
    <Link
      href={`/exam/${exam.exam_id}`}
      className="block bg-goukaku-surface rounded-[20px] p-3.5"
    >
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-[16px] mb-2.5`}>
        📘
      </div>
      <div className="text-[13px] font-bold leading-tight line-clamp-2">{shortTitle(exam)}</div>
      <div className="mt-1 text-[11px] tracking-[1.2px] font-bold text-goukaku-ink/45 uppercase">
        {exam.year || exam.exam_id}
      </div>
      <div className="mt-2 text-[11px] text-goukaku-ink/60">{exam.question_count} 問</div>
    </Link>
  )
}
