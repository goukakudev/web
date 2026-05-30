import Link from "next/link"
import type { ExamSummary } from "@/lib/types"
import { shortTitle } from "@/lib/exam-utils"

const NEW_EXAM_IDS_FE = new Set([
  "fe-2020r02t-a",
  "fe-2021r03t-a",
  "fe-2022r04t-a",
])

const NEW_EXAM_IDS_IP = new Set([
  "ip-2026r08",
  "ip-2025r07",
  "ip-2024r06",
])

const NEW_EXAM_IDS_AP = new Set([
  "ap-2025r07h-a",
  "ap-2024r06a-a",
  "ap-2024r06h-a",
])

export function NewExamsSection({
  exams,
  subject = "fe",
}: {
  exams: ExamSummary[]
  subject?: "fe" | "ip" | "ap"
}) {
  const newIds =
    subject === "ip"
      ? NEW_EXAM_IDS_IP
      : subject === "ap"
        ? NEW_EXAM_IDS_AP
        : NEW_EXAM_IDS_FE
  const newExams = exams.filter((e) => newIds.has(e.exam_id))
  if (newExams.length === 0) return null
  const examUrlBase = `/${subject}/exam`
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
            href={`${examUrlBase}/${exam.exam_id}`}
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
