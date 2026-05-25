import type { Metadata } from "next"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { GuideContent } from "@/components/seo/GuideContent"
import { TakkenSectionNav } from "@/components/layout/TakkenSectionNav"
import { TAKKEN_GUIDE } from "@/lib/seo/guide/takken"

const TITLE = "宅地建物取引士試験 学習ガイド — 試験概要・出題範囲・合格点・勉強法"
const DESCRIPTION =
  "宅地建物取引士(宅建士)試験の学習ガイド。試験概要・受験資格・申込み(7月)・出題範囲(権利関係/宅建業法/法令上の制限/税その他)・合格基準(35〜38 点)・標準学習スケジュール(300〜500 時間)・分野別の攻略のコツ・合格.devの使い方まで、独学合格に必要な情報を 1 ページに集約。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/takken/guide",
  type: "article",
})

export default function TakkenGuidePage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Breadcrumbs items={[
          { name: "合格.dev", href: "/" },
          { name: "宅建", href: "/takken" },
          { name: "学習ガイド", href: "/takken/guide" },
        ]} />
        <header className="mb-6">
          <h1 className="font-mincho text-3xl font-semibold tracking-wide text-ink leading-[1.45]">
            宅建士試験 学習ガイド
          </h1>
          <p className="mt-2 text-xs tracking-widest text-ink-3">
            宅地建物取引士試験 独学合格マニュアル
          </p>
        </header>
        <GuideContent
          title={TITLE}
          description={DESCRIPTION}
          chapters={TAKKEN_GUIDE}
          path="/takken/guide"
          faqHref="/takken/faq"
          examTopHref="/takken"
          examTopLabel="宅建 のトップ"
          theme="takken"
        />
        <footer className="mt-12 border-t border-line pt-6 text-xs text-ink-3">
          <div className="mb-6">
            <TakkenSectionNav />
          </div>
        </footer>
      </div>
    </main>
  )
}
