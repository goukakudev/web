import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { CategoryPageContent } from "@/components/seo/CategoryPageContent"
import { IP_CATEGORIES } from "@/lib/seo/category-meta/ip"
import { fetchCategoryPageData } from "@/lib/seo/category-page"

interface PageProps {
  params: Promise<{ cat: string }>
}

export function generateStaticParams() {
  return IP_CATEGORIES.map((c) => ({ cat: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cat } = await params
  const meta = IP_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) return {}
  return makeMetadata({
    title: `${meta.name} のITパスポート試験 過去問 — ${meta.shortName}分野`,
    description: `IT パスポート試験(IP)の ${meta.name} 分野の過去問まとめ。${meta.description.slice(0, 80)}…`,
    path: `/ip/category/${cat}`,
  })
}

export default async function IpCategoryPage({ params }: PageProps) {
  const { cat } = await params
  const meta = IP_CATEGORIES.find((c) => c.slug === cat)
  if (!meta) notFound()
  const data = await fetchCategoryPageData("ip", meta)

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "ITパスポート試験", href: "/ip" },
        { name: meta.name, href: `/ip/category/${cat}` },
      ]} />
      <CategoryPageContent
        meta={meta}
        matchedTags={data.matchedTags}
        sampleQuestions={data.sampleQuestions}
        totalMatched={data.totalMatched}
        subjectFullName="ITパスポート試験"
        tagBase="/ip/tag"
        playBase="/ip/play"
        path={`/ip/category/${cat}`}
      />
    </MobileFrame>
  )
}
