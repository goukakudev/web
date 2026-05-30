import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { CategoryPageContent } from "@/components/seo/CategoryPageContent"
import { AP_CATEGORIES } from "@/lib/seo/category-meta/ap"
import { fetchCategoryPageData } from "@/lib/seo/category-page"

interface PageProps {
  params: Promise<{ cat: string }>
}

export function generateStaticParams() {
  return AP_CATEGORIES.map((c) => ({ cat: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cat } = await params
  const meta = AP_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) return {}
  return makeMetadata({
    title: `${meta.name} の応用情報技術者試験 過去問 — ${meta.shortName}分野`,
    description: `応用情報技術者試験(AP)の ${meta.name} 分野の過去問まとめ。${meta.description.slice(0, 80)}…`,
    path: `/ap/category/${cat}`,
  })
}

export default async function ApCategoryPage({ params }: PageProps) {
  const { cat } = await params
  const meta = AP_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) notFound()
  const data = await fetchCategoryPageData("ap", meta)

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "応用情報技術者試験", href: "/ap" },
        { name: meta.name, href: `/ap/category/${cat}` },
      ]} />
      <CategoryPageContent
        meta={meta}
        matchedTags={data.matchedTags}
        sampleQuestions={data.sampleQuestions}
        totalMatched={data.totalMatched}
        subjectFullName="応用情報技術者試験"
        tagBase="/ap/tag"
        playBase="/ap/play"
        path={`/ap/category/${cat}`}
      />
    </MobileFrame>
  )
}
