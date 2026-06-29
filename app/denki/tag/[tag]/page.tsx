import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DenkiFrame } from "@/components/denki/DenkiFrame"
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
  const canonical = `/denki/tag/${slug}`
  return makeMetadata({ title, description, path: canonical, noindex: true })
}

export default async function DkTagPage({ params }: PageProps) {
  const { tag: tagParam } = await params

  if (decodeURIComponent(tagParam).startsWith("#")) {
    redirect(`/denki/tag/${tagToSlug(slugToTag(tagParam))}`)
  }

  const tag = slugToTag(tagParam)
  const display = tag.replace(/^#/, "")
  const slug = tagToSlug(tag)

  const data = await fetchTagPageData("dk", tag)
  const intro = buildTagIntro({ subject: "dk", display, count: data.questions.length })

  return (
    <DenkiFrame
      title={`#${display} の過去問`}
      eyebrow="FIELD TAG"
      description={`第二種電気工事士 学科試験の「${display}」分野をまとめて確認できます。`}
    >
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "第二種電気工事士", href: "/denki" },
        { name: `#${display}`, href: `/denki/tag/${slug}` },
      ]} />
      <TagPageContent
        display={display}
        slug={slug}
        intro={intro}
        questions={data.questions}
        examsById={data.examsById}
        relatedTags={data.relatedTags}
        subject="dk"
        tagBase="/denki/tag"
        playBase="/denki/play"
        examBase="/denki/exam"
        subjectFullName="第二種電気工事士 学科試験"
        variant="denki"
      />
    </DenkiFrame>
  )
}
