import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "ITパスポート試験 過去問 + 解説 — 合格.dev"

export default async function Image() {
  return renderOgImage({
    title: "ITパスポート試験 過去問",
    subtitle: "29 年分・全 2,900 問・解説 + ヒント付き",
    badge: "IP / ITパスポート",
    accent: "pink",
  })
}
