import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { GuideContent } from "@/components/seo/GuideContent"
import { AP_GUIDE } from "@/lib/seo/guide/ap"

const TITLE = "応用情報技術者試験 学習ガイド — 試験概要・出題範囲・合格基準・勉強法"
const DESCRIPTION =
  "応用情報技術者試験(AP)の学習ガイド。試験概要・受験資格・申込み・午前午後の構成・出題範囲・合格基準(午前午後とも 60 点以上)・標準学習スケジュール(200〜500 時間)・分野別の攻略のコツ・合格.devの使い方まで、独学合格に必要な情報を 1 ページに集約。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/ap/guide",
  type: "article",
})

export default function ApGuidePage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "応用情報技術者試験", href: "/ap" },
        { name: "学習ガイド", href: "/ap/guide" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3 leading-[1.4]">
        応用情報技術者試験 学習ガイド
      </h1>
      <GuideContent
        title={TITLE}
        description={DESCRIPTION}
        chapters={AP_GUIDE}
        path="/ap/guide"
        faqHref="/ap/faq"
        examTopHref="/ap"
        examTopLabel="応用情報技術者試験 のトップ"
      />
    </MobileFrame>
  )
}
