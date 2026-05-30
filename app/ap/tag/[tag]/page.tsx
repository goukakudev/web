import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { tagToSlug, slugToTag } from "@/lib/tag-url"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { TagPageContent } from "@/components/seo/TagPageContent"
import { buildTagIntro, fetchTagPageData } from "@/lib/seo/tag-page"

interface PageProps {
  params: Promise<{ tag: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: tagParam } = await params
  const tag = slugToTag(tagParam)
  const slug = tagToSlug(tag)
  const display = tag.replace(/^#/, "")
  const title = `#${display} の過去問 (応用情報技術者)`
  const description = `応用情報技術者試験の過去問のうち「${display}」タグが付いた問題の一覧。解説・ヒント付き。`
  const canonical = `/ap/tag/${slug}`
  return makeMetadata({ title, description, path: canonical })
}

export default async function ApTagPage({ params }: PageProps) {
  const { tag: tagParam } = await params

  if (decodeURIComponent(tagParam).startsWith("#")) {
    redirect(`/ap/tag/${tagToSlug(slugToTag(tagParam))}`)
  }

  const tag = slugToTag(tagParam)
  const display = tag.replace(/^#/, "")
  const slug = tagToSlug(tag)

  const data = await fetchTagPageData("ap", tag)
  const intro = buildTagIntro({ subject: "ap", display, count: data.questions.length })

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "応用情報技術者試験", href: "/ap" },
        { name: `#${display}`, href: `/ap/tag/${slug}` },
      ]} />
      <TagPageContent
        display={display}
        slug={slug}
        intro={intro}
        questions={data.questions}
        examsById={data.examsById}
        relatedTags={data.relatedTags}
        subject="ap"
        tagBase="/ap/tag"
        playBase="/ap/play"
        examBase="/ap/exam"
        subjectFullName="応用情報技術者試験"
      />
    </MobileFrame>
  )
}
