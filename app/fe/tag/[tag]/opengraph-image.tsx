import { slugToTag } from "@/lib/tag-url"
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "FE タグ別過去問"

export default async function Image({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag: tagParam } = await params
  const tag = slugToTag(tagParam).replace(/^#/, "")
  return renderOgImage({
    title: `#${tag}`,
    subtitle: "基本情報技術者試験 タグ別過去問",
    badge: "FE / タグ",
    accent: "blue",
  })
}
