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
  const title = `#${display} の過去問 (情報処理安全確保支援士試験)`
  const description = `情報処理安全確保支援士試験の過去問のうち「${display}」タグが付いた問題の一覧。解説・ヒント付き。`
  const canonical = `/sc/tag/${slug}`
  return makeMetadata({ title, description, path: canonical })
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

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: `#${display}`, href: `/sc/tag/${slug}` },
      ]} />
      <TagPageContent
        display={display}
        slug={slug}
        intro={intro}
        questions={data.questions}
        examsById={data.examsById}
        relatedTags={data.relatedTags}
        subject="sc"
        tagBase="/sc/tag"
        playBase="/sc/play"
        examBase="/sc/exam"
        subjectFullName="情報処理安全確保支援士試験"
      />
    </MobileFrame>
  )
}
