import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "基本情報技術者試験 過去問 + 解説 — 合格.dev"

export default async function Image() {
  return renderOgImage({
    title: "基本情報技術者試験 過去問",
    subtitle: "13 年分・全 1,000 問・解説 + 模試モード付き",
    badge: "FE / 基本情報",
    accent: "blue",
  })
}
