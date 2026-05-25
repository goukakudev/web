import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { GuideContent } from "@/components/seo/GuideContent"
import { FE_GUIDE } from "@/lib/seo/guide/fe"

const TITLE = "基本情報技術者試験 学習ガイド — 試験概要・出題範囲・合格点・勉強法"
const DESCRIPTION =
  "基本情報技術者試験(FE)の学習ガイド。試験概要・受験資格・申込み・出題範囲・合格基準(科目A/B IRT)・標準学習スケジュール(200〜300時間)・分野別の攻略のコツ・合格.devの使い方まで、独学合格に必要な情報を 1 ページに集約。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/fe/guide",
  type: "article",
})

export default function FeGuidePage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "基本情報技術者試験", href: "/fe" },
        { name: "学習ガイド", href: "/fe/guide" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3 leading-[1.4]">
        基本情報技術者試験 学習ガイド
      </h1>
      <GuideContent
        title={TITLE}
        description={DESCRIPTION}
        chapters={FE_GUIDE}
        path="/fe/guide"
        faqHref="/fe/faq"
        examTopHref="/fe"
        examTopLabel="基本情報技術者試験 のトップ"
      />
    </MobileFrame>
  )
}
