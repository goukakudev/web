import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { CategoryPageContent } from "@/components/seo/CategoryPageContent"
import { FE_CATEGORIES } from "@/lib/seo/category-meta/fe"
import { fetchCategoryPageData } from "@/lib/seo/category-page"

interface PageProps {
  params: Promise<{ cat: string }>
}

export function generateStaticParams() {
  return FE_CATEGORIES.map((c) => ({ cat: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cat } = await params
  const meta = FE_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) return {}
  return makeMetadata({
    title: `${meta.name} の基本情報技術者試験 過去問 — ${meta.shortName}分野`,
    description: `基本情報技術者試験(FE)の ${meta.name} 分野の過去問まとめ。${meta.description.slice(0, 80)}…`,
    path: `/fe/category/${cat}`,
  })
}

export default async function FeCategoryPage({ params }: PageProps) {
  const { cat } = await params
  const meta = FE_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) notFound()
  const data = await fetchCategoryPageData("fe", meta)

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "基本情報技術者試験", href: "/fe" },
        { name: meta.name, href: `/fe/category/${cat}` },
      ]} />
      <CategoryPageContent
        meta={meta}
        matchedTags={data.matchedTags}
        sampleQuestions={data.sampleQuestions}
        totalMatched={data.totalMatched}
        subjectFullName="基本情報技術者試験"
        tagBase="/fe/tag"
        playBase="/fe/play"
        path={`/fe/category/${cat}`}
      />
    </MobileFrame>
  )
}
