import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { FaqAccordion } from "@/components/seo/FaqAccordion"
import { SC_FAQ } from "@/lib/seo/faq/sc"

export const metadata: Metadata = makeMetadata({
  title: "情報処理安全確保支援士試験 FAQ",
  description:
    "情報処理安全確保支援士試験 (SC、登録セキスペ) に関するよくある質問。合格基準 (各区分 100 点中 60 点以上)・試験時間・受験料・合格率・午前 I 免除制度・午後の記述式対策・登録制度 (毎年講習・3 年で実践講習) などを独自編集でまとめています。",
  path: "/sc/faq",
})

export default function ScFaqPage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: "FAQ", href: "/sc/faq" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3">
        情報処理安全確保支援士試験 FAQ
      </h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/80 mb-6">
        情報処理安全確保支援士試験 (SC) について、合格基準 (各区分 100 点中 60 点以上)・試験形式 (PBT / 年 2 回)・申し込み・学習時間・午前 I 免除・登録制度・午後の記述式対策など、よく聞かれる質問を {SC_FAQ.length} 項目にまとめました。
      </p>
      <FaqAccordion items={SC_FAQ} />
      <p className="text-[11px] opacity-60 pt-6 mt-8 border-t border-goukaku-divider">
        ← <Link href="/sc" className="underline">情報処理安全確保支援士試験 のトップ</Link> ・ <Link href="/sc/guide" className="underline">学習ガイドを読む</Link> ・ <Link href="/contact" className="underline">問題報告・お問い合わせ</Link>
      </p>
    </MobileFrame>
  )
}
