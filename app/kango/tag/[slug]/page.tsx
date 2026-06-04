import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listAllKnQuestions } from "@/lib/kango/api"
import { makeMetadata } from "@/lib/seo/metadata"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbJsonLd, collectionPageJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { tagToSlug, slugToTag } from "@/lib/tag-url"
import { KangoNav, KangoBreadcrumb } from "@/components/kango/KangoNav"
import { KangoQuestionList } from "@/components/kango/KangoQuestionList"

export const revalidate = 86400

// タグは多数のため SSG せず on-demand (ƒ) で生成する。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tag = slugToTag(slug).replace(/^#/, "")
  return makeMetadata({
    title: `${tag} の看護過去問`,
    description: `看護師・保健師・助産師 国家試験で「${tag}」に関する過去問を、選択肢別解説つきで無料演習。`,
    path: `/kango/tag/${slug}`,
  })
}

export default async function KangoTagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tag = slugToTag(slug) // "#" 付き
  const label = tag.replace(/^#/, "")

  const all = await listAllKnQuestions().catch(() => [])
  const questions = all
    .filter((q) => q.tags?.includes(tag))
    .sort((a, b) => (a.exam_id === b.exam_id ? a.q_number - b.q_number : a.exam_id < b.exam_id ? 1 : -1))
  if (!questions.length) notFound()

  const url = `${SITE_URL}/kango/tag/${tagToSlug(tag)}`

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 48px" }}>
        <KangoBreadcrumb
          items={[
            { name: "合格.dev", href: "/" },
            { name: "看護", href: "/kango" },
            { name: label, href: `/kango/tag/${slug}` },
          ]}
        />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "合格.dev", url: `${SITE_URL}/` },
            { name: "看護師国家試験 過去問", url: `${SITE_URL}/kango` },
            { name: label, url },
          ])}
        />
        <JsonLd
          data={collectionPageJsonLd({
            name: `${label} の看護過去問`,
            description: `「${label}」に関する看護国家試験の過去問 ${questions.length}問。`,
            url,
            items: questions.slice(0, 50).map((q) => ({
              name: `${q.exam_id} 問${q.q_number}`,
              url: `${SITE_URL}/kango/play/${q.exam_id}/q/${q.q_number}`,
            })),
          })}
        />

        <header style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-kn-primary-text)", margin: "0 0 4px" }}>タグ</p>
          <h1 style={{ fontSize: 23, fontWeight: 800, color: "var(--color-kn-text-1)", margin: 0 }}>{label}</h1>
          <p style={{ fontSize: 12.5, color: "var(--color-kn-text-3)", margin: "6px 0 0" }}>看護過去問 {questions.length}問</p>
        </header>

        <KangoQuestionList questions={questions} />

        <footer style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--color-kn-line)" }}>
          <KangoNav />
        </footer>
      </div>
    </main>
  )
}
