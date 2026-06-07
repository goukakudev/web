import type { Metadata } from "next"
import Link from "next/link"
import { makeMetadata } from "@/lib/seo/metadata"
import { SC_FAQ } from "@/lib/seo/faq/sc"
import { ScPageFrame } from "@/components/sc/ScPageFrame"
import { ScBreadcrumbs } from "@/components/sc/ScBreadcrumbs"
import { JsonLd } from "@/components/seo/JsonLd"

export const metadata: Metadata = makeMetadata({
  title: "情報処理安全確保支援士試験 FAQ",
  description:
    "情報処理安全確保支援士試験 (SC、登録セキスペ) に関するよくある質問。合格基準 (各区分 100 点中 60 点以上)・試験時間・受験料・合格率・午前 I 免除制度・午後の記述式対策・登録制度 (毎年講習・3 年で実践講習) などを独自編集でまとめています。",
  path: "/sc/faq",
})

export default function ScFaqPage() {
  return (
    <ScPageFrame title="FAQ">
      <ScBreadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: "FAQ", href: "/sc/faq" },
      ]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: SC_FAQ.map((it) => ({
            "@type": "Question",
            name: it.question,
            acceptedAnswer: { "@type": "Answer", text: it.answer },
          })),
        }}
      />
      <p className="sc-page-subtitle">SC FAQ</p>
      <h1 className="sc-page-title">情報処理安全確保支援士試験 FAQ</h1>
      <p className="sc-page-lead">
        情報処理安全確保支援士試験 (SC) について、合格基準 (各区分 100 点中 60 点以上)・試験形式 (PBT / 年 2 回)・申し込み・学習時間・午前 I 免除・登録制度・午後の記述式対策など、よく聞かれる質問を {SC_FAQ.length} 項目にまとめました。
      </p>

      <div className="sc-faq" style={{ marginTop: "1.5rem" }}>
        {SC_FAQ.map((it, i) => (
          <details key={i}>
            <summary>{it.question}</summary>
            <p>{it.answer}</p>
          </details>
        ))}
      </div>

      <p className="sc-footnote">
        ← <Link href="/sc">情報処理安全確保支援士試験 のトップ</Link>
        {" ・ "}
        <Link href="/sc/guide">学習ガイドを読む</Link>
        {" ・ "}
        <Link href="/contact">問題報告・お問い合わせ</Link>
      </p>
    </ScPageFrame>
  )
}
