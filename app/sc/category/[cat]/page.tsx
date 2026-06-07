import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { CategoryPageContent } from "@/components/seo/CategoryPageContent"
import { SC_CATEGORIES } from "@/lib/seo/category-meta/sc"
import { fetchCategoryPageData } from "@/lib/seo/category-page"

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

export default async function ScCategoryPage({ params }: PageProps) {
  const { cat } = await params
  const meta = SC_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) notFound()
  const data = await fetchCategoryPageData("sc", meta)

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: meta.name, href: `/sc/category/${cat}` },
      ]} />
      <CategoryPageContent
        meta={meta}
        matchedTags={data.matchedTags}
        sampleQuestions={data.sampleQuestions}
        totalMatched={data.totalMatched}
        subjectFullName="情報処理安全確保支援士試験"
        tagBase="/sc/tag"
        playBase="/sc/play"
        path={`/sc/category/${cat}`}
      />
    </MobileFrame>
  )
}
