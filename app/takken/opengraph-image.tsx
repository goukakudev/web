import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "宅地建物取引士 過去問 — 合格.dev"

export default async function Image() {
  return renderOgImage({
    title: "宅地建物取引士 過去問",
    subtitle: "H16〜R7 まで・全試験・関連条文/判例ポップアップ",
    badge: "宅建",
    accent: "charcoal",
  })
}
