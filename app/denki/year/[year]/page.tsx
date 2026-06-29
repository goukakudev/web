import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { listDkExams } from "@/lib/api-client"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { DenkiTopNav } from "@/components/denki/DenkiFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import {
  itemListJsonLd,
  collectionPageJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { buildYearIntro, groupExamsByYear } from "@/lib/seo/year-summary"
import type { ExamSummary } from "@/lib/types"

interface PageProps {
  params: Promise<{ year: string }>
}

/**
 * 第二種電気工事士の `year` は純和暦("令和8年度")で、共有の prettyYear /
 * sortYearsDesc(西暦キー前提)では正しく整形・整列できない。API は実施日の降順で
 * 返るため、初出順をそのまま「新しい順」として扱う(denki トップの latest 取得と同じ前提)。
 */
function yearsByRecency(exams: ExamSummary[]): string[] {
  return [
    ...new Set(exams.map((e) => e.year).filter((y): y is string => Boolean(y))),
  ]
}

function examLabel(exam: ExamSummary): string {
  return exam.title ?? [exam.year, exam.section].filter(Boolean).join(" ") ?? exam.exam_id
}

export async function generateStaticParams() {
  const exams = await listDkExams()
  const byYear = groupExamsByYear(exams)
  return [...byYear.keys()]
    .filter((y) => y && y !== "unknown")
    .map((year) => ({ year: encodeURIComponent(year) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year: yearSlug } = await params
  const yearKey = decodeURIComponent(yearSlug)
  const exams = await listDkExams()
  const byYear = groupExamsByYear(exams)
  if (!byYear.has(yearKey)) return {}
  const yearExams = byYear.get(yearKey)!
  const total = yearExams.reduce((s, e) => s + (e.question_count ?? 0), 0)
  return makeMetadata({
    // 同セクションの layout が "%s | 第二種電気工事士 | 合格.dev" を付与するため、
    // ここでは試験名を繰り返さない(重複回避)。
    title: `${yearKey} 学科試験 過去問 ${total} 問`,
    description: `第二種電気工事士 学科試験 ${yearKey} の過去問 ${yearExams.length} 回・全 ${total} 問の一覧。図入り問題・選択肢別解説付き。`,
    path: `/denki/year/${yearSlug}`,
    noindex: true,
  })
}

export default async function DenkiYearPage({ params }: PageProps) {
  const { year: yearSlug } = await params
  const yearKey = decodeURIComponent(yearSlug)
  const allExams = await listDkExams()
  const byYear = groupExamsByYear(allExams)
  if (!byYear.has(yearKey)) notFound()
  const yearExams = byYear.get(yearKey)!
  const total = yearExams.reduce((s, e) => s + (e.question_count ?? 0), 0)
  const yearsDesc = yearsByRecency(allExams)
  const idx = yearsDesc.indexOf(yearKey)
  const prevYear = idx > 0 ? yearsDesc[idx - 1] : undefined
  const nextYear =
    idx >= 0 && idx < yearsDesc.length - 1 ? yearsDesc[idx + 1] : undefined
  const intro = buildYearIntro({
    subject: "dk",
    yearDisplay: yearKey,
    examCount: yearExams.length,
    totalQuestions: total,
  })

  return (
    <main className="min-h-screen bg-[#f5f2e8] text-[#191815]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <DenkiTopNav />
        <Breadcrumbs
          items={[
            { name: "合格.dev", href: "/" },
            { name: "第二種電気工事士 学科試験", href: "/denki" },
            { name: yearKey, href: `/denki/year/${yearSlug}` },
          ]}
        />
        <JsonLd
          data={collectionPageJsonLd({
            name: `${yearKey} 第二種電気工事士 学科試験 過去問`,
            description: `第二種電気工事士 学科試験 ${yearKey} の試験回 ${yearExams.length} 件`,
            url: `${SITE_URL}/denki/year/${yearSlug}`,
            items: yearExams.map((e) => ({
              name: examLabel(e),
              url: `${SITE_URL}/denki/exam/${e.exam_id}`,
            })),
          })}
        />
        <JsonLd
          data={itemListJsonLd(
            yearExams.map((e) => ({
              name: examLabel(e),
              url: `${SITE_URL}/denki/exam/${e.exam_id}`,
            })),
          )}
        />

        <h1 className="mt-4 text-[26px] font-black leading-tight sm:text-[32px]">
          {yearKey} 第二種電気工事士 学科試験 過去問
        </h1>
        <p className="mt-3 max-w-3xl text-[13px] leading-[1.85] text-[#4d473a]">
          {intro}
        </p>

        <section className="mt-7">
          <h2 className="text-[18px] font-black">{yearKey} の試験回</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {yearExams.map((e) => (
              <li key={e.exam_id}>
                <Link
                  href={`/denki/exam/${e.exam_id}`}
                  className="block min-h-[96px] rounded-lg border border-[#d8d1bc] bg-[#fffdf6] p-4 transition hover:-translate-y-0.5 hover:border-[#191815] hover:shadow-[4px_4px_0_#191815]"
                >
                  <div className="text-[11px] font-black tracking-[0.12em] text-[#6c6252]">
                    {e.exam_id}
                  </div>
                  <div className="mt-2 text-[15px] font-black leading-snug">
                    {examLabel(e)}
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-[#6c6252]">
                    全 {e.question_count} 問
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {(prevYear || nextYear) && (
          <nav aria-label="前後の年度" className="mt-7 flex gap-2 text-[12px]">
            {prevYear && (
              <Link
                href={`/denki/year/${encodeURIComponent(prevYear)}`}
                className="flex-1 rounded-lg border border-[#d8d1bc] bg-white px-3 py-2 font-extrabold hover:border-[#191815]"
              >
                ← {prevYear}
              </Link>
            )}
            {nextYear && (
              <Link
                href={`/denki/year/${encodeURIComponent(nextYear)}`}
                className="flex-1 rounded-lg border border-[#d8d1bc] bg-white px-3 py-2 text-right font-extrabold hover:border-[#191815]"
              >
                {nextYear} →
              </Link>
            )}
          </nav>
        )}

        <p className="mt-7 border-t border-[#d8d1bc] pt-3 text-[12px] text-[#6c6252]">
          ←{" "}
          <Link href="/denki" className="underline">
            第二種電気工事士 学科試験 過去問のトップ
          </Link>
          へ
        </p>

        <SiteFooter />
      </div>
    </main>
  )
}
