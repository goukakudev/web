import Link from "next/link"
import type { ExamSummary } from "@/lib/types"
import { shortTitle } from "@/lib/exam-utils"
import { TileProgress } from "./TileProgress"

const TILE_COLORS = [
  "bg-goukaku-lime",
  "bg-goukaku-pink",
  "bg-goukaku-cool",
  "bg-goukaku-purple",
] as const

export function SubjectTile({
  exam,
  index,
  subject = "fe",
}: {
  exam: ExamSummary
  index: number
  subject?: "fe" | "ip" | "ap" | "sg"
}) {
  const color = TILE_COLORS[index % TILE_COLORS.length]
  const href = `/${subject}/exam/${exam.exam_id}`
  return (
    <Link
      href={href}
      className="block bg-goukaku-surface rounded-[20px] p-3.5"
    >
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-[16px] mb-2.5`}>
        📘
      </div>
      <div className="text-[13px] font-bold leading-tight line-clamp-2">{shortTitle(exam)}</div>
      <div className="mt-1 text-[11px] tracking-[1.2px] font-bold text-goukaku-ink/45 uppercase">
        {exam.year || exam.exam_id}
      </div>
      <TileProgress
        examId={exam.exam_id}
        total={exam.question_count}
        colorClass={color}
      />
    </Link>
  )
}
