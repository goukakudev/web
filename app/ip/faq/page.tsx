import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { FaqAccordion } from "@/components/seo/FaqAccordion"
import { IP_FAQ } from "@/lib/seo/faq/ip"

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート試験 FAQ",
  description:
    "ITパスポート試験(IP)に関するよくある質問。合格点(分野別評価)・試験時間・受験料・合格率・推奨学習時間・ストラテジ/マネジメント/テクノロジ各分野の対策・基本情報技術者試験との違いなどをまとめています。",
  path: "/ip/faq",
})

export default function IpFaqPage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "ITパスポート試験", href: "/ip" },
        { name: "FAQ", href: "/ip/faq" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3">
        ITパスポート試験 FAQ
      </h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/80 mb-6">
        IT パスポート試験(IP)について、合格基準(3 分野別評価 + 総合)・試験形式・申し込み・学習時間・分野別の対策など、よく聞かれる質問を {IP_FAQ.length} 項目にまとめました。
      </p>
      <FaqAccordion items={IP_FAQ} />
      <p className="text-[11px] opacity-60 pt-6 mt-8 border-t border-goukaku-divider">
        ← <Link href="/ip" className="underline">IT パスポート試験 のトップ</Link> ・ <Link href="/contact" className="underline">問題報告・お問い合わせ</Link>
      </p>
    </MobileFrame>
  )
}
