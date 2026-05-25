import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "合格.dev — 資格試験の過去問学習"

export default async function Image() {
  return renderOgImage({
    title: "資格試験の過去問学習",
    subtitle: "ITパスポート・基本情報技術者・宅地建物取引士",
    badge: "合格.dev",
    accent: "pink",
  })
}
