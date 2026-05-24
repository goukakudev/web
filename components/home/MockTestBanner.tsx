import Link from "next/link"
import type { ExamSummary } from "@/lib/types"

export function MockTestBanner({
  exam,
  subject = "fe",
}: {
  exam?: ExamSummary
  subject?: "fe" | "ip"
}) {
  if (!exam) return null
  const href =
    subject === "ip"
      ? `/ip/play/${exam.exam_id}?mode=exam`
      : `/fe/play/${exam.exam_id}?mode=exam`
  const duration = subject === "ip" ? "120 分" : "90 分"
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
