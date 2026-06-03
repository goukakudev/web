import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listAllKnQuestions } from "@/lib/kango/api"
import { categoryBySlug, KANGO_CATEGORIES } from "@/lib/kango/categories"
import { makeMetadata } from "@/lib/seo/metadata"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbJsonLd, collectionPageJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { KangoNav, KangoBreadcrumb } from "@/components/kango/KangoNav"
import { KangoQuestionList } from "@/components/kango/KangoQuestionList"

export const revalidate = 86400

export function generateStaticParams() {
  return KANGO_CATEGORIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cat = categoryBySlug(slug)
  if (!cat) return {}
  return makeMetadata({
    title: `${cat.name} 過去問`,
    description: `${cat.examType}国家試験「${cat.name}」の過去問を、選択肢別解説つきで無料演習。${cat.description}`,
    path: `/kango/category/${slug}`,
  })
}

export default async function KangoCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = categoryBySlug(slug)
  if (!cat) notFound()

  const all = await listAllKnQuestions().catch(() => [])
  const questions = all
    .filter((q) => q.category === slug)
    .sort((a, b) => (a.exam_id === b.exam_id ? a.q_number - b.q_number : a.exam_id < b.exam_id ? 1 : -1))

  const url = `${SITE_URL}/kango/category/${slug}`

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 48px" }}>
        <KangoBreadcrumb
          items={[
            { name: "合格.dev", href: "/" },
            { name: "看護", href: "/kango" },
            { name: cat.name, href: `/kango/category/${slug}` },
          ]}
        />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "合格.dev", url: `${SITE_URL}/` },
            { name: "看護師国家試験 過去問", url: `${SITE_URL}/kango` },
            { name: cat.name, url },
          ])}
        />
        <JsonLd
          data={collectionPageJsonLd({
            name: `${cat.name} 過去問`,
            description: cat.description,
            url,
            items: questions.slice(0, 50).map((q) => ({
              name: `${q.exam_id} 問${q.q_number}`,
              url: `${SITE_URL}/kango/play/${q.exam_id}?qid=${encodeURIComponent(q._id)}`,
            })),
          })}
        />

        <header style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-kn-primary-text)", margin: "0 0 4px" }}>
            {cat.examType}国家試験
          </p>
          <h1 style={{ fontSize: 23, fontWeight: 800, color: "var(--color-kn-text-1)", margin: 0 }}>{cat.name}</h1>
          <p style={{ fontSize: 12.5, color: "var(--color-kn-text-3)", margin: "6px 0 0" }}>過去問 {questions.length}問</p>
        </header>
        <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "var(--color-kn-text-2)", marginBottom: 18 }}>{cat.description}</p>

        {questions.length > 0 ? (
          <KangoQuestionList questions={questions} />
        ) : (
          <div className="kn-card" style={{ padding: 24, textAlign: "center", color: "var(--color-kn-text-3)" }}>
            この分野の問題は現在ありません。
          </div>
        )}

        <footer style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--color-kn-line)" }}>
          <KangoNav />
        </footer>
      </div>
    </main>
  )
}
