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
  const title = `#${display} の過去問 (第二種電気工事士)`
  const description = `第二種電気工事士 学科試験の過去問のうち「${display}」タグが付いた問題の一覧。解説・ヒント付き。`
  const canonical = `/dk/tag/${slug}`
  return makeMetadata({ title, description, path: canonical, noindex: true })
}

export default async function DkTagPage({ params }: PageProps) {
  const { tag: tagParam } = await params

  if (decodeURIComponent(tagParam).startsWith("#")) {
    redirect(`/dk/tag/${tagToSlug(slugToTag(tagParam))}`)
  }

  const tag = slugToTag(tagParam)
  const display = tag.replace(/^#/, "")
  const slug = tagToSlug(tag)

  const data = await fetchTagPageData("dk", tag)
  const intro = buildTagIntro({ subject: "dk", display, count: data.questions.length })

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "第二種電気工事士", href: "/dk" },
        { name: `#${display}`, href: `/dk/tag/${slug}` },
      ]} />
      <TagPageContent
        display={display}
        slug={slug}
        intro={intro}
        questions={data.questions}
        examsById={data.examsById}
        relatedTags={data.relatedTags}
        subject="dk"
        tagBase="/dk/tag"
        playBase="/dk/play"
        examBase="/dk/exam"
        subjectFullName="第二種電気工事士 学科試験"
      />
    </MobileFrame>
  )
}
