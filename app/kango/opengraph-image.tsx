import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "看護師国家試験 過去問 — 合格.dev"

export default async function Image() {
  return renderOgImage({
    title: "看護師国家試験 過去問",
    subtitle: "看護師・保健師・助産師 / 選択肢別解説つき・無料",
    badge: "看護",
    accent: "blue",
  })
}
