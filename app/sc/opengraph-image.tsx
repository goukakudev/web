import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og"

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "情報処理安全確保支援士試験 過去問 + 解説 — 合格.dev"

export default async function Image() {
  return renderOgImage({
    title: "情報処理安全確保支援士試験 過去問",
    subtitle: "午前 II 公開過去問・解説 + ヒント付き",
    badge: "SC / 登録セキスペ",
    accent: "charcoal",
  })
}
