import type { Metadata } from "next"
import Link from "next/link"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { FaqAccordion } from "@/components/seo/FaqAccordion"
import { TakkenSectionNav } from "@/components/layout/TakkenSectionNav"
import { TAKKEN_FAQ } from "@/lib/seo/faq/takken"

export const metadata: Metadata = makeMetadata({
  title: "宅地建物取引士試験 FAQ",
  description:
    "宅地建物取引士(宅建士)試験に関するよくある質問。合格点・試験時間・受験料・合格率・推奨学習時間・宅建業法の重要性・5点免除制度・民法改正の影響などをまとめています。",
  path: "/takken/faq",
})

export default function TakkenFaqPage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Breadcrumbs items={[
          { name: "合格.dev", href: "/" },
          { name: "宅建", href: "/takken" },
          { name: "FAQ", href: "/takken/faq" },
        ]} />
        <header className="mb-8">
          <h1 className="font-mincho text-3xl font-semibold tracking-wide text-ink">
            宅建士 FAQ
          </h1>
          <p className="mt-2 text-xs tracking-widest text-ink-3">
            宅地建物取引士試験 よくある質問
          </p>
        </header>
        <p className="text-[13px] leading-[1.85] text-ink-2 mb-7">
          宅地建物取引士(宅建士)試験について、合格基準・試験形式・申し込み・学習時間・分野別の対策など、よく聞かれる質問を {TAKKEN_FAQ.length} 項目にまとめました。
        </p>
        <FaqAccordion items={TAKKEN_FAQ} theme="takken" />
        <p className="text-[11px] opacity-60 pt-6 mt-8 border-t border-line text-ink-3">
          ← <Link href="/takken" className="underline">宅建 のトップ</Link> ・ <Link href="/contact" className="underline">問題報告・お問い合わせ</Link>
        </p>
        <footer className="mt-12 border-t border-line pt-6 text-xs text-ink-3">
          <div className="mb-6">
            <TakkenSectionNav />
          </div>
        </footer>
      </div>
    </main>
  )
}
