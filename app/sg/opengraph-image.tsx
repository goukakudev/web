import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "情報セキュリティマネジメント試験 過去問 + 解説 — 合格.dev"

export default async function Image() {
  return renderOgImage({
    title: "情報セキュリティマネジメント試験 過去問",
    subtitle: "科目 A 公開過去問・解説 + ヒント付き",
    badge: "SG / 情報セキュリティ",
    accent: "charcoal",
  })
}
