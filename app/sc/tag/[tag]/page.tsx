import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { tagToSlug, slugToTag } from "@/lib/tag-url"
import { makeMetadata } from "@/lib/seo/metadata"
import { collectionPageJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { ScPageFrame } from "@/components/sc/ScPageFrame"
import { ScBreadcrumbs } from "@/components/sc/ScBreadcrumbs"
import { ScSectionHead } from "@/components/sc/ScChrome"
import { buildTagIntro, fetchTagPageData } from "@/lib/seo/tag-page"

interface PageProps {
  params: Promise<{ tag: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: tagParam } = await params
  const tag = slugToTag(tagParam)
  const slug = tagToSlug(tag)
  const display = tag.replace(/^#/, "")
  const title = `#${display} の過去問 (情報処理安全確保支援士試験)`
  const description = `情報処理安全確保支援士試験の過去問のうち「${display}」タグが付いた問題の一覧。解説・ヒント付き。`
  const canonical = `/sc/tag/${slug}`
  return makeMetadata({ title, description, path: canonical, noindex: true })
}

function stripPlain(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/[#*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default async function ScTagPage({ params }: PageProps) {
  const { tag: tagParam } = await params

  if (decodeURIComponent(tagParam).startsWith("#")) {
    redirect(`/sc/tag/${tagToSlug(slugToTag(tagParam))}`)
  }

  const tag = slugToTag(tagParam)
  const display = tag.replace(/^#/, "")
  const slug = tagToSlug(tag)

  const data = await fetchTagPageData("sc", tag)
  const intro = buildTagIntro({ subject: "sc", display, count: data.questions.length })

  const examYearSet = new Set<string>()
  for (const q of data.questions) examYearSet.add(q.exam_id)
  const examYears = [...examYearSet]
    .map((eid) => data.examsById.get(eid))
    .filter(<T,>(e: T | undefined): e is T => Boolean(e))
    .sort((a, b) => (a.exam_id < b.exam_id ? 1 : -1))

  return (
    <ScPageFrame title={`#${display}`}>
      <ScBreadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: `#${display}`, href: `/sc/tag/${slug}` },
      ]} />
      <JsonLd
        data={collectionPageJsonLd({
          name: `#${display} の情報処理安全確保支援士試験 過去問`,
          description: `情報処理安全確保支援士試験の過去問のうち「${display}」タグが付いた ${data.questions.length} 問の一覧`,
          url: `${SITE_URL}/sc/tag/${slug}`,
          items: data.questions.slice(0, 100).map((q) => ({
            name: `${data.examsById.get(q.exam_id)?.title ?? q.exam_id} 問${q.q_number}`,
            url: `${SITE_URL}/sc/play/${q.exam_id}/q/${q.q_number}`,
          })),
        })}
      />

      <p className="sc-page-subtitle">SC TAG</p>
      <h1 className="sc-page-title">#{display}</h1>
      <p className="sc-page-lead">{intro}</p>

      {data.questions.length === 0 ? (
        <p className="sc-footnote" style={{ borderTop: 0, textAlign: "center", marginTop: "2rem" }}>
          該当する問題がありません
        </p>
      ) : (
        <>
          <ScSectionHead title={`このタグの問題 (${data.questions.length} 問)`} />
          <div className="sc-q-list">
            {data.questions.map((q) => {
              const exam = data.examsById.get(q.exam_id)
              const preview = stripPlain(q.body).slice(0, 64)
              return (
                <Link key={q._id} href={`/sc/play/${q.exam_id}/q/${q.q_number}`} className="sc-q-row">
                  <span className="sc-q-row-num">問 {q.q_number}</span>
                  <span className="sc-q-row-text">
                    {exam?.title ?? q.exam_id} ・ {preview}{preview.length === 64 ? "…" : ""}
                  </span>
                </Link>
              )
            })}
          </div>

          {data.relatedTags.length > 0 && (
            <>
              <ScSectionHead title="関連タグ" />
              <div className="sc-tag-row">
                {data.relatedTags.map((t) => (
                  <Link key={t.tag} href={`/sc/tag/${tagToSlug(t.tag)}`} className="sc-tag-chip">
                    <span className="sc-tag-chip-dot" aria-hidden />
                    <span className="sc-tag-chip-name">{t.tag.replace(/^#/, "")}</span>
                    <span className="sc-tag-chip-count">{t.count}</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {examYears.length > 0 && (
            <>
              <ScSectionHead title="収録試験年度" />
              <div className="sc-mode-list">
                {examYears.map((e) => (
                  <Link key={e.exam_id} href={`/sc/exam/${e.exam_id}`} className="sc-mode-btn">
                    <span className="sc-mode-btn-icon">📄</span>
                    <span className="sc-mode-btn-text">
                      <span className="sc-mode-btn-title">{e.title ?? e.exam_id}</span>
                      <span className="sc-mode-btn-sub">{e.exam_id}</span>
                    </span>
                    <span className="sc-mode-btn-arrow">›</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <p className="sc-footnote">
        ← <Link href="/sc">情報処理安全確保支援士試験 のトップ</Link>へ
      </p>
    </ScPageFrame>
  )
}
