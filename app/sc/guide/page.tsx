import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { GuideContent } from "@/components/seo/GuideContent"
import { SC_GUIDE } from "@/lib/seo/guide/sc"

const TITLE = "情報処理安全確保支援士試験 学習ガイド — 試験概要・出題範囲・合格点・午前 I 免除・登録制度"
const DESCRIPTION =
  "情報処理安全確保支援士試験 (SC) の学習ガイド。試験概要・受験資格・申込み (年 2 回 PBT)・午前 I/II・午後の出題構成・合格基準 (各 60 点)・午前 I 免除制度・標準学習スケジュール (150〜400 時間)・分野別の攻略 (Web/ネットワーク/認証/暗号/マネジメント/法令)・登録制度 (情報処理安全確保支援士) まで、独自編集で 1 ページに集約。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/sc/guide",
  type: "article",
})

export default function ScGuidePage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: "学習ガイド", href: "/sc/guide" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3 leading-[1.4]">
        情報処理安全確保支援士試験 学習ガイド
      </h1>
      <GuideContent
        title={TITLE}
        description={DESCRIPTION}
        chapters={SC_GUIDE}
        path="/sc/guide"
        faqHref="/sc/faq"
        examTopHref="/sc"
        examTopLabel="情報処理安全確保支援士試験 のトップ"
      />
    </MobileFrame>
  )
}
