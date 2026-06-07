import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { makeMetadata } from "@/lib/seo/metadata"
import { JsonLd } from "@/components/seo/JsonLd"
import { collectionPageJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { ScPageFrame } from "@/components/sc/ScPageFrame"
import { ScBreadcrumbs } from "@/components/sc/ScBreadcrumbs"
import { ScSectionHead } from "@/components/sc/ScChrome"
import { SC_CATEGORIES } from "@/lib/seo/category-meta/sc"
import { fetchCategoryPageData } from "@/lib/seo/category-page"
import { tagToSlug } from "@/lib/tag-url"

interface PageProps {
  params: Promise<{ cat: string }>
}

export function generateStaticParams() {
  return SC_CATEGORIES.map((c) => ({ cat: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cat } = await params
  const meta = SC_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) return {}
  return makeMetadata({
    title: `${meta.name} の情報処理安全確保支援士試験 過去問 — ${meta.shortName}分野`,
    description: `情報処理安全確保支援士試験(SC)の ${meta.name} 分野の過去問まとめ。${meta.description.slice(0, 80)}…`,
    path: `/sc/category/${cat}`,
  })
}

function stripPlain(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/[#*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default async function ScCategoryPage({ params }: PageProps) {
  const { cat } = await params
  const meta = SC_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) notFound()
  const data = await fetchCategoryPageData("sc", meta)

  return (
    <ScPageFrame title="分野別 過去問">
      <ScBreadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: meta.name, href: `/sc/category/${cat}` },
      ]} />
      <JsonLd
        data={collectionPageJsonLd({
          name: `${meta.name} の情報処理安全確保支援士試験 過去問`,
          description: `情報処理安全確保支援士試験 ${meta.name} 分野 の過去問・タグ・関連分野まとめ`,
          url: `${SITE_URL}/sc/category/${cat}`,
          items: data.matchedTags.map((t) => ({
            name: `${t.tag} (${t.count} 問)`,
            url: `${SITE_URL}/sc/tag/${tagToSlug(t.tag)}`,
          })),
        })}
      />

      <p className="sc-page-subtitle">{meta.shortName}</p>
      <h1 className="sc-page-title">{meta.name}</h1>
      <p className="sc-page-lead">{meta.description}</p>

      {data.matchedTags.length > 0 && (
        <>
          <ScSectionHead
            title={`分野タグ (${data.matchedTags.length} 件 / 合計 ${data.totalMatched} 問)`}
          />
          <div className="sc-tag-grid">
            {data.matchedTags.map((t) => (
              <Link key={t.tag} href={`/sc/tag/${tagToSlug(t.tag)}`} className="sc-tag-grid-item">
                <span className="sc-tag-grid-item-name">{t.tag}</span>
                <span className="sc-tag-grid-item-count">{t.count}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <ScSectionHead title="学習のコツ" />
      <div className="sc-chapter-body" style={{ padding: "0 1.375rem" }}>
        {meta.studyTips}
      </div>

      {data.sampleQuestions.length > 0 && (
        <>
          <ScSectionHead title={`代表問題 ${data.sampleQuestions.length} 件`} />
          <div className="sc-q-list">
            {data.sampleQuestions.map(({ q, exam }) => {
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
        </>
      )}

      <p className="sc-footnote">
        ← <Link href="/sc">情報処理安全確保支援士試験 のトップ</Link>へ
      </p>
    </ScPageFrame>
  )
}
