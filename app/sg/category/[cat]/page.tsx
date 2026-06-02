import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { CategoryPageContent } from "@/components/seo/CategoryPageContent"
import { SG_CATEGORIES } from "@/lib/seo/category-meta/sg"
import { fetchCategoryPageData } from "@/lib/seo/category-page"

interface PageProps {
  params: Promise<{ cat: string }>
}

export function generateStaticParams() {
  return SG_CATEGORIES.map((c) => ({ cat: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cat } = await params
  const meta = SG_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) return {}
  return makeMetadata({
    title: `${meta.name} の情報セキュリティマネジメント試験 過去問 — ${meta.shortName}分野`,
    description: `情報セキュリティマネジメント試験(SG)の ${meta.name} 分野の過去問まとめ。${meta.description.slice(0, 80)}…`,
    path: `/sg/category/${cat}`,
  })
}

export default async function SgCategoryPage({ params }: PageProps) {
  const { cat } = await params
  const meta = SG_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) notFound()
  const data = await fetchCategoryPageData("sg", meta)

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報セキュリティマネジメント試験", href: "/sg" },
        { name: meta.name, href: `/sg/category/${cat}` },
      ]} />
      <CategoryPageContent
        meta={meta}
        matchedTags={data.matchedTags}
        sampleQuestions={data.sampleQuestions}
        totalMatched={data.totalMatched}
        subjectFullName="情報セキュリティマネジメント試験"
        tagBase="/sg/tag"
        playBase="/sg/play"
        path={`/sg/category/${cat}`}
      />
    </MobileFrame>
  )
}
