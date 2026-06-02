import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { GuideContent } from "@/components/seo/GuideContent"
import { SG_GUIDE } from "@/lib/seo/guide/sg"

const TITLE = "情報セキュリティマネジメント試験 学習ガイド — 試験概要・出題範囲・合格基準・勉強法"
const DESCRIPTION =
  "情報セキュリティマネジメント試験(SG)の学習ガイド。試験概要・受験資格・申込み・科目 A / 科目 B の構成・出題範囲・合格基準(1,000 点満点中 600 点以上)・標準学習スケジュール(30〜100 時間)・分野別の攻略のコツ・合格.devの使い方まで、独学合格に必要な情報を 1 ページに集約。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/sg/guide",
  type: "article",
})

export default function SgGuidePage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報セキュリティマネジメント試験", href: "/sg" },
        { name: "学習ガイド", href: "/sg/guide" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3 leading-[1.4]">
        情報セキュリティマネジメント試験 学習ガイド
      </h1>
      <GuideContent
        title={TITLE}
        description={DESCRIPTION}
        chapters={SG_GUIDE}
        path="/sg/guide"
        faqHref="/sg/faq"
        examTopHref="/sg"
        examTopLabel="情報セキュリティマネジメント試験 のトップ"
      />
    </MobileFrame>
  )
}
