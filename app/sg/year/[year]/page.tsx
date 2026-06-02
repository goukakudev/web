import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { listSgExams } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import {
  itemListJsonLd,
  collectionPageJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import {
  buildYearIntro,
  buildYearSummary,
  groupExamsByYear,
  prettyYear,
  sortYearsDesc,
} from "@/lib/seo/year-summary"

interface PageProps {
  params: Promise<{ year: string }>
}

export async function generateStaticParams() {
  const exams = await listSgExams()
  const byYear = groupExamsByYear(exams)
  return [...byYear.keys()].map((year) => ({ year: encodeURIComponent(year) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year: yearSlug } = await params
  const yearKey = decodeURIComponent(yearSlug)
  const exams = await listSgExams()
  const byYear = groupExamsByYear(exams)
  if (!byYear.has(yearKey)) return {}
  const yearExams = byYear.get(yearKey)!
  const total = yearExams.reduce((s, e) => s + e.question_count, 0)
  const display = prettyYear(yearKey)
  return makeMetadata({
    title: `${display} 情報セキュリティマネジメント試験 過去問 ${total} 問`,
    description: `情報セキュリティマネジメント試験 ${display} の過去問 ${yearExams.length} 回・全 ${total} 問の一覧。試験回ごとの出題内訳・解説・ヒント付き。`,
    path: `/sg/year/${yearSlug}`,
  })
}

export default async function SgYearPage({ params }: PageProps) {
  const { year: yearSlug } = await params
  const yearKey = decodeURIComponent(yearSlug)
  const allExams = await listSgExams()
  const byYear = groupExamsByYear(allExams)
  if (!byYear.has(yearKey)) notFound()
  const yearExams = byYear.get(yearKey)!
  const allYearsDesc = sortYearsDesc([...byYear.keys()])
  const summary = buildYearSummary({ yearKey, exams: yearExams, allYearsDesc })
  const intro = buildYearIntro({
    subject: "sg",
    yearDisplay: summary.yearDisplay,
    examCount: yearExams.length,
    totalQuestions: summary.totalQuestions,
  })

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報セキュリティマネジメント試験", href: "/sg" },
        { name: summary.yearDisplay, href: `/sg/year/${yearSlug}` },
      ]} />
      <JsonLd
        data={collectionPageJsonLd({
          name: `${summary.yearDisplay} 情報セキュリティマネジメント試験 過去問`,
          description: `情報セキュリティマネジメント試験 ${summary.yearDisplay} の試験回 ${yearExams.length} 件`,
          url: `${SITE_URL}/sg/year/${yearSlug}`,
          items: yearExams.map((e) => ({
            name: e.title ?? `${e.year} ${e.section}`,
            url: `${SITE_URL}/sg/exam/${e.exam_id}`,
          })),
        })}
      />
      <JsonLd
        data={itemListJsonLd(
          yearExams.map((e) => ({
            name: e.title ?? `${e.year} ${e.section}`,
            url: `${SITE_URL}/sg/exam/${e.exam_id}`,
          })),
        )}
      />

      <h1 className="text-[20px] font-extrabold mb-3">
        {summary.yearDisplay} 情報セキュリティマネジメント試験 過去問
      </h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/80 mb-6">{intro}</p>

      <section className="mb-7">
        <h2 className="text-[15px] font-extrabold mb-3 text-goukaku-ink/85">
          {summary.yearDisplay} の試験回
        </h2>
        <ul className="space-y-2">
          {yearExams.map((e) => (
            <li key={e.exam_id}>
              <Link
                href={`/sg/exam/${e.exam_id}`}
                className="block rounded-2xl border border-goukaku-divider bg-goukaku-surface/40 p-3.5 hover:bg-goukaku-surface"
              >
                <div className="text-[10px] tracking-[1.2px] font-bold text-goukaku-ink/50 uppercase">
                  {e.exam_id}
                </div>
                <div className="text-[15px] font-extrabold mt-1">
                  {e.title ?? `${e.year} ${e.section}`}
                </div>
                <div className="text-[11px] opacity-60 mt-1">
                  全 {e.question_count} 問
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {(summary.prevYear || summary.nextYear) && (
        <nav aria-label="前後の年度" className="flex gap-2 text-[12px] mb-7">
          {summary.prevYear && (
            <Link
              href={`/sg/year/${encodeURIComponent(summary.prevYear)}`}
              className="flex-1 rounded-lg border border-goukaku-divider px-3 py-2 hover:bg-goukaku-surface"
            >
              ← {prettyYear(summary.prevYear)}
            </Link>
          )}
          {summary.nextYear && (
            <Link
              href={`/sg/year/${encodeURIComponent(summary.nextYear)}`}
              className="flex-1 rounded-lg border border-goukaku-divider px-3 py-2 text-right hover:bg-goukaku-surface"
            >
              {prettyYear(summary.nextYear)} →
            </Link>
          )}
        </nav>
      )}

      <p className="text-[11px] opacity-60 pt-3 border-t border-goukaku-divider">
        ← <Link href="/sg" className="underline">情報セキュリティマネジメント試験 のトップ</Link>へ
      </p>
    </MobileFrame>
  )
}
