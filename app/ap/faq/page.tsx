import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { FaqAccordion } from "@/components/seo/FaqAccordion"
import { AP_FAQ } from "@/lib/seo/faq/ap"

export const metadata: Metadata = makeMetadata({
  title: "応用情報技術者試験 FAQ",
  description:
    "応用情報技術者試験(AP)に関するよくある質問。合格基準(午前午後とも 60 点以上)・試験時間・受験料・合格率・推奨学習時間・午前午後の構成・基本情報技術者試験との違い・午前 I 免除などをまとめています。",
  path: "/ap/faq",
})

export default function ApFaqPage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "応用情報技術者試験", href: "/ap" },
        { name: "FAQ", href: "/ap/faq" },
      ]} />
      <h1 className="text-[22px] font-extrabold mb-3">
        応用情報技術者試験 FAQ
      </h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/80 mb-6">
        応用情報技術者試験(AP)について、合格基準(午前・午後とも 60 点以上)・試験形式・申し込み・学習時間・分野別の対策など、よく聞かれる質問を {AP_FAQ.length} 項目にまとめました。
      </p>
      <FaqAccordion items={AP_FAQ} />
      <p className="text-[11px] opacity-60 pt-6 mt-8 border-t border-goukaku-divider">
        ← <Link href="/ap" className="underline">応用情報技術者試験 のトップ</Link> ・ <Link href="/contact" className="underline">問題報告・お問い合わせ</Link>
      </p>
    </MobileFrame>
  )
}
