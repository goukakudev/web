import Link from "next/link"
import type { ExamSummary } from "@/lib/types"
import { groupExamsByYear, sortYearsDesc, prettyYear } from "@/lib/seo/year-summary"

export type YearLinkSubject = "fe" | "ip" | "ap" | "sg"

/**
 * 資格別入口から年度ハブ /{sub}/year/{yearKey} への内部リンク。
 *
 * 年度ハブ自体は noindex(集約ページ)だが、これまで入口からの内部リンクが無く
 * 孤立していた。入口から各年度へ明示的にリンクすることで、利用者に年度別導線を
 * 提供しつつ、ハブ経由で各回(exam)ページへ評価を流す。
 */
export function SubjectYearLinks({
  subject,
  exams,
}: {
  subject: YearLinkSubject
  exams: ExamSummary[]
}) {
  const byYear = groupExamsByYear(exams)
  const years = sortYearsDesc([...byYear.keys()]).filter(
    (y) => y && y !== "unknown",
  )
  if (years.length === 0) return null
  return (
    <section className="mt-9">
      <h2 className="text-[18px] font-extrabold mb-3.5">年度別に過去問を解く</h2>
      <ul className="grid grid-cols-2 gap-2.5">
        {years.map((y) => {
          const total =
            byYear.get(y)?.reduce((s, e) => s + (e.question_count ?? 0), 0) ?? 0
          return (
            <li key={y}>
              <Link
                href={`/${subject}/year/${encodeURIComponent(y)}`}
                className="block rounded-2xl border border-goukaku-divider bg-goukaku-surface/40 p-3 hover:bg-goukaku-surface"
              >
                <div className="text-[13px] font-extrabold">{prettyYear(y)}</div>
                <div className="mt-0.5 text-[11px] opacity-60">全 {total} 問</div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
