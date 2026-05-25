import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { FaqAccordion } from "@/components/seo/FaqAccordion"
import { FE_FAQ } from "@/lib/seo/faq/fe"

export const metadata: Metadata = makeMetadata({
  title: "基本情報技術者試験 FAQ",
  description:
    "基本情報技術者試験(FE)に関するよくある質問。合格点・試験時間・受験料・合格率・推奨学習時間・科目B対策・午前免除制度・ITパスポートとの違いなどをまとめています。",
  path: "/fe/faq",
})

export default function FeFaqPage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "基本情報技術者試験", href: "/fe" },
        { name: "FAQ", href: "/fe/faq" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3">
        基本情報技術者試験 FAQ
      </h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/80 mb-6">
        基本情報技術者試験(FE)について、合格点・試験形式・申し込み・学習時間・分野別の対策など、よく聞かれる質問を {FE_FAQ.length} 項目にまとめました。
      </p>
      <FaqAccordion items={FE_FAQ} />
      <p className="text-[11px] opacity-60 pt-6 mt-8 border-t border-goukaku-divider">
        ← <Link href="/fe" className="underline">基本情報技術者試験 のトップ</Link> ・ <Link href="/contact" className="underline">問題報告・お問い合わせ</Link>
      </p>
    </MobileFrame>
  )
}
