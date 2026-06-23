import Link from "next/link"
import type { ExamSummary } from "@/lib/types"
import type { QuizSubject } from "@/lib/exam-utils"

export function MockTestBanner({
  exam,
  subject = "fe",
}: {
  exam?: ExamSummary
  subject?: QuizSubject
}) {
  if (!exam) return null
  const href = `/${subject}/play/${exam.exam_id}?mode=exam`
  // SC は午前 II (40 分・25 問) を web の演習対象とするため、模試表記も 40 分。
  // 午前 I 免除ありを前提にしている。
  const duration =
    subject === "ap" ? "150 分"
    : subject === "ip" ? "120 分"
    : subject === "dk" ? "120 分"
    : subject === "sc" ? "40 分"
    : "90 分"
  return (
    <Link
      href={href}
      className="block bg-goukaku-ink-fixed rounded-[24px] p-5 relative overflow-hidden mt-6"
    >
      <div
        className="text-[22px] text-goukaku-lime"
        style={{ fontFamily: "var(--font-script)" }}
      >
        Mock test
      </div>
      <div className="mt-1 text-[16px] font-extrabold text-white">本番形式の模試</div>
      <div className="mt-1 text-[11px] text-white/60">{duration} · 採点あり</div>
      <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 bg-goukaku-lime text-goukaku-ink-fixed px-3.5 py-2 rounded-full font-extrabold text-[13px]">
        挑戦 →
      </span>
    </Link>
  )
}
