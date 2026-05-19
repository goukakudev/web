import Link from "next/link"
import type { ExamSummary } from "@/lib/types"

const NEW_EXAM_IDS = new Set([
  "fe-2020r02t-a",
  "fe-2021r03t-a",
  "fe-2022r04t-a",
])

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

export function NewExamsSection({ exams }: { exams: ExamSummary[] }) {
  const newExams = exams.filter((e) => NEW_EXAM_IDS.has(e.exam_id))
  if (newExams.length === 0) return null
  return (
    <div className="mt-7">
      <div
        className="text-[22px] text-goukaku-pink-script"
        style={{ fontFamily: "var(--font-script)" }}
      >
        New
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">新着問題</div>
      <div className="-mx-5 px-5 flex gap-3 overflow-x-auto pb-1">
        {newExams.map((exam) => (
          <Link
            key={exam.exam_id}
            href={`/exam/${exam.exam_id}`}
            className="relative shrink-0 w-[210px] rounded-[20px] bg-goukaku-surface p-4"
          >
            <span className="absolute top-2.5 right-2.5 bg-goukaku-pink text-goukaku-ink text-[10px] font-extrabold tracking-[1.4px] px-2 py-0.5 rounded-full">
              NEW
            </span>
            <div className="w-10 h-10 rounded-full bg-goukaku-lime flex items-center justify-center text-[16px] mb-2.5">
              ✨
            </div>
            <div className="text-[13px] font-bold leading-tight line-clamp-2 pr-10">
              {shortTitle(exam)}
            </div>
            <div className="mt-2 text-[11px] text-goukaku-ink/60">
              {exam.question_count} 問
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
