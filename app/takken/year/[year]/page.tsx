import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { TakkenAPI, type TakkenExam } from "@/lib/takken/api"
import { makeMetadata } from "@/lib/seo/metadata"
import {
  itemListJsonLd,
  collectionPageJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

interface PageProps {
  params: Promise<{ year: string }>
}

function groupTakkenByYear(exams: TakkenExam[]): Map<number, TakkenExam[]> {
  const m = new Map<number, TakkenExam[]>()
  for (const e of exams) {
    const list = m.get(e.year) ?? []
    list.push(e)
    m.set(e.year, list)
  }
  for (const [, list] of m) {
    list.sort((a, b) => a.exam_month - b.exam_month)
  }
  return m
}

export async function generateStaticParams() {
  const exams = await TakkenAPI.listExams()
  const byYear = groupTakkenByYear(exams)
  return [...byYear.keys()].map((y) => ({ year: String(y) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year: yearSlug } = await params
  const year = Number(yearSlug)
  if (!Number.isInteger(year)) return {}
  const exams = await TakkenAPI.listExams()
  const byYear = groupTakkenByYear(exams)
  if (!byYear.has(year)) return {}
  const yearExams = byYear.get(year)!
  const total = yearExams.reduce((s, e) => s + e.question_count, 0)
  return makeMetadata({
    title: `${year} 年 過去問 ${total} 問`,
    description: `宅地建物取引士試験 ${year} 年実施分の過去問 ${yearExams.length} 回・全 ${total} 問。関連条文・判例タップで本文ポップアップ表示。`,
    path: `/takken/year/${yearSlug}`,
  })
}

export default async function TakkenYearPage({ params }: PageProps) {
  const { year: yearSlug } = await params
  const year = Number(yearSlug)
  if (!Number.isInteger(year)) notFound()
  const allExams = await TakkenAPI.listExams()
  const byYear = groupTakkenByYear(allExams)
  if (!byYear.has(year)) notFound()
  const yearExams = byYear.get(year)!
  const totalQuestions = yearExams.reduce((s, e) => s + e.question_count, 0)
  const years = [...byYear.keys()].sort((a, b) => b - a)
  const idx = years.indexOf(year)
  const prevYear = idx > 0 ? years[idx - 1] : undefined
  const nextYear = idx >= 0 && idx < years.length - 1 ? years[idx + 1] : undefined

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Breadcrumbs items={[
          { name: "合格.dev", href: "/" },
          { name: "宅建", href: "/takken" },
          { name: `${year} 年度`, href: `/takken/year/${yearSlug}` },
        ]} />
        <JsonLd
          data={collectionPageJsonLd({
            name: `${year} 年 宅建 過去問`,
            description: `宅地建物取引士試験 ${year} 年実施分 ${yearExams.length} 回`,
            url: `${SITE_URL}/takken/year/${yearSlug}`,
            items: yearExams.map((e) => ({
              name: e.label,
              url: `${SITE_URL}/takken/exams/${e.exam_id}`,
            })),
          })}
        />
        <JsonLd
          data={itemListJsonLd(
            yearExams.map((e) => ({
              name: e.label,
              url: `${SITE_URL}/takken/exams/${e.exam_id}`,
            })),
          )}
        />

        <header className="mb-8">
          <h1 className="font-mincho text-3xl font-semibold tracking-wide text-ink">
            {year} 年 宅建 過去問
          </h1>
          <p className="mt-2 text-xs tracking-widest text-ink-3">
            宅地建物取引士試験 {year} 年実施分
          </p>
        </header>

        <p className="text-[13px] leading-[1.85] text-ink-2 mb-7">
          {year} 年に実施された宅地建物取引士試験 {yearExams.length} 回(全 {totalQuestions} 問)の過去問演習ページです。
          各試験回ごとに通常演習・模試モード(50 問通し)で取り組めます。関連条文・判例タップで本文を即時ポップアップ参照できます。
        </p>

        <section className="mb-8">
          <h2 className="mb-3 font-mincho text-sm tracking-widest text-ink-3">
            {year} 年の試験
          </h2>
          <ul className="space-y-2.5">
            {yearExams.map((e) => (
              <li key={e.exam_id}>
                <Link
                  href={`/takken/exams/${e.exam_id}`}
                  className="block rounded-xl border border-line bg-bg p-3.5 transition hover:bg-canvas"
                >
                  <p className="font-mincho text-base text-ink">{e.label}</p>
                  <p className="mt-1 text-xs text-ink-3">
                    {e.question_count} 問
                    {e.passing_score && ` ・合格点 ${e.passing_score} 点`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {(prevYear || nextYear) && (
          <nav aria-label="前後の年度" className="flex gap-2 text-[12px] mb-8">
            {prevYear && (
              <Link
                href={`/takken/year/${prevYear}`}
                className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-ink-2 hover:bg-canvas"
              >
                ← {prevYear} 年
              </Link>
            )}
            {nextYear && (
              <Link
                href={`/takken/year/${nextYear}`}
                className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-right text-ink-2 hover:bg-canvas"
              >
                {nextYear} 年 →
              </Link>
            )}
          </nav>
        )}

      </div>
    </main>
  )
}
