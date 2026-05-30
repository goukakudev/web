import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "応用情報技術者試験 過去問 + 解説 — 合格.dev"

export default async function Image() {
  return renderOgImage({
    title: "応用情報技術者試験 過去問",
    subtitle: "18 回分・全 1,440 問・解説 + ヒント付き",
    badge: "AP / 応用情報",
    accent: "charcoal",
  })
}
