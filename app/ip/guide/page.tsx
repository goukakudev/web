import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { GuideContent } from "@/components/seo/GuideContent"
import { IP_GUIDE } from "@/lib/seo/guide/ip"

const TITLE = "ITパスポート試験 学習ガイド — 試験概要・出題範囲・合格点・勉強法"
const DESCRIPTION =
  "IT パスポート試験(IP)の学習ガイド。試験概要・受験資格・申込み・3 分野構成(ストラテジ/マネジメント/テクノロジ)・合格基準(分野別 300 点 + 総合 600 点)・標準学習スケジュール(100〜150 時間)・分野別の攻略のコツ・合格.devの使い方まで、独学合格に必要な情報を 1 ページに集約。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/ip/guide",
  type: "article",
})

export default function IpGuidePage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "ITパスポート試験", href: "/ip" },
        { name: "学習ガイド", href: "/ip/guide" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3 leading-[1.4]">
        ITパスポート試験 学習ガイド
      </h1>
      <GuideContent
        title={TITLE}
        description={DESCRIPTION}
        chapters={IP_GUIDE}
        path="/ip/guide"
        faqHref="/ip/faq"
        examTopHref="/ip"
        examTopLabel="IT パスポート試験 のトップ"
      />
    </MobileFrame>
  )
}
