import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { listScExams } from "@/lib/api-client"
import { makeMetadata } from "@/lib/seo/metadata"
import {
  itemListJsonLd,
  collectionPageJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { ScPageFrame } from "@/components/sc/ScPageFrame"
import { ScBreadcrumbs } from "@/components/sc/ScBreadcrumbs"
import { ScSectionHead, ScHairline } from "@/components/sc/ScChrome"
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
  const exams = await listScExams()
  const byYear = groupExamsByYear(exams)
  return [...byYear.keys()].map((year) => ({ year: encodeURIComponent(year) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year: yearSlug } = await params
  const yearKey = decodeURIComponent(yearSlug)
  const exams = await listScExams()
  const byYear = groupExamsByYear(exams)
  if (!byYear.has(yearKey)) return {}
  const yearExams = byYear.get(yearKey)!
  const total = yearExams.reduce((s, e) => s + e.question_count, 0)
  const display = prettyYear(yearKey)
  return makeMetadata({
    title: `${display} 情報処理安全確保支援士試験 過去問 ${total} 問`,
    description: `情報処理安全確保支援士試験 ${display} の過去問 ${yearExams.length} 回・全 ${total} 問の一覧。試験回ごとの出題内訳・解説・ヒント付き。`,
    path: `/sc/year/${yearSlug}`,
    noindex: true,
  })
}

export default async function ScYearPage({ params }: PageProps) {
  const { year: yearSlug } = await params
  const yearKey = decodeURIComponent(yearSlug)
  const allExams = await listScExams()
  const byYear = groupExamsByYear(allExams)
  if (!byYear.has(yearKey)) notFound()
  const yearExams = byYear.get(yearKey)!
  const allYearsDesc = sortYearsDesc([...byYear.keys()])
  const summary = buildYearSummary({ yearKey, exams: yearExams, allYearsDesc })
  const intro = buildYearIntro({
    subject: "sc",
    yearDisplay: summary.yearDisplay,
    examCount: yearExams.length,
    totalQuestions: summary.totalQuestions,
  })

  return (
    <ScPageFrame title={summary.yearDisplay}>
      <ScBreadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: summary.yearDisplay, href: `/sc/year/${yearSlug}` },
      ]} />
      <JsonLd
        data={collectionPageJsonLd({
          name: `${summary.yearDisplay} 情報処理安全確保支援士試験 過去問`,
          description: `情報処理安全確保支援士試験 ${summary.yearDisplay} の試験回 ${yearExams.length} 件`,
          url: `${SITE_URL}/sc/year/${yearSlug}`,
          items: yearExams.map((e) => ({
            name: e.title ?? `${e.year} ${e.section}`,
            url: `${SITE_URL}/sc/exam/${e.exam_id}`,
          })),
        })}
      />
      <JsonLd
        data={itemListJsonLd(
          yearExams.map((e) => ({
            name: e.title ?? `${e.year} ${e.section}`,
            url: `${SITE_URL}/sc/exam/${e.exam_id}`,
          })),
        )}
      />

      <p className="sc-page-subtitle">SC EXAMS</p>
      <h1 className="sc-page-title">{summary.yearDisplay} 過去問</h1>
      <p className="sc-page-lead">{intro}</p>

      <ScSectionHead title={`${summary.yearDisplay} の試験回`} />
      <div className="sc-mode-list">
        {yearExams.map((e) => (
          <Link key={e.exam_id} href={`/sc/exam/${e.exam_id}`} className="sc-mode-btn">
            <span className="sc-mode-btn-icon">📄</span>
            <span className="sc-mode-btn-text">
              <span className="sc-mode-btn-title">{e.title ?? `${e.year} ${e.section}`}</span>
              <span className="sc-mode-btn-sub">{e.exam_id}・全 {e.question_count} 問</span>
            </span>
            <span className="sc-mode-btn-arrow">›</span>
          </Link>
        ))}
      </div>

      {(summary.prevYear || summary.nextYear) && (
        <nav aria-label="前後の年度" className="sc-pager">
          {summary.prevYear ? (
            <Link href={`/sc/year/${encodeURIComponent(summary.prevYear)}`} data-side="prev">
              ← {prettyYear(summary.prevYear)}
            </Link>
          ) : (
            <span />
          )}
          {summary.nextYear ? (
            <Link href={`/sc/year/${encodeURIComponent(summary.nextYear)}`} data-side="next">
              {prettyYear(summary.nextYear)} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      <p className="sc-footnote">
        ← <Link href="/sc">情報処理安全確保支援士試験 のトップ</Link>へ
      </p>
      <ScHairline />
    </ScPageFrame>
  )
}
