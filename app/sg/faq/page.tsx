import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { FaqAccordion } from "@/components/seo/FaqAccordion"
import { SG_FAQ } from "@/lib/seo/faq/sg"

export const metadata: Metadata = makeMetadata({
  title: "情報セキュリティマネジメント試験 FAQ",
  description:
    "情報セキュリティマネジメント試験(SG)に関するよくある質問。合格基準(1,000 点満点中 600 点以上)・試験時間・受験料・合格率・推奨学習時間・科目 A / 科目 B の構成・基本情報技術者試験との違いなどをまとめています。",
  path: "/sg/faq",
})

export default function SgFaqPage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報セキュリティマネジメント試験", href: "/sg" },
        { name: "FAQ", href: "/sg/faq" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3">
        情報セキュリティマネジメント試験 FAQ
      </h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/80 mb-6">
        情報セキュリティマネジメント試験(SG)について、合格基準(1,000 点満点中 600 点以上)・試験形式・申し込み・学習時間・分野別の対策など、よく聞かれる質問を {SG_FAQ.length} 項目にまとめました。
      </p>
      <FaqAccordion items={SG_FAQ} />
      <p className="text-[11px] opacity-60 pt-6 mt-8 border-t border-goukaku-divider">
        ← <Link href="/sg" className="underline">情報セキュリティマネジメント試験 のトップ</Link> ・ <Link href="/contact" className="underline">問題報告・お問い合わせ</Link>
      </p>
    </MobileFrame>
  )
}
