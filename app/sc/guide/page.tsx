import type { Metadata } from "next"
import Link from "next/link"
import { makeMetadata } from "@/lib/seo/metadata"
import { SC_GUIDE } from "@/lib/seo/guide/sc"
import { ScPageFrame } from "@/components/sc/ScPageFrame"
import { ScBreadcrumbs } from "@/components/sc/ScBreadcrumbs"
import { JsonLd } from "@/components/seo/JsonLd"
import { SITE_URL, SITE_NAME } from "@/lib/seo/structured-data"

const TITLE = "情報処理安全確保支援士試験 学習ガイド — 試験概要・出題範囲・合格点・午前 I 免除・登録制度"
const DESCRIPTION =
  "情報処理安全確保支援士試験 (SC) の学習ガイド。試験概要・受験資格・申込み (年 2 回 PBT)・午前 I/II・午後の出題構成・合格基準 (各 60 点)・午前 I 免除制度・標準学習スケジュール (150〜400 時間)・分野別の攻略 (Web/ネットワーク/認証/暗号/マネジメント/法令)・登録制度 (情報処理安全確保支援士) まで、独自編集で 1 ページに集約。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/sc/guide",
  type: "article",
})

export default function ScGuidePage() {
  return (
    <ScPageFrame title="学習ガイド">
      <ScBreadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: "学習ガイド", href: "/sc/guide" },
      ]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": ["Article", "LearningResource"],
          headline: TITLE,
          description: DESCRIPTION,
          author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
          mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/sc/guide` },
          inLanguage: "ja",
          url: `${SITE_URL}/sc/guide`,
          articleSection: SC_GUIDE.map((c) => c.heading),
          learningResourceType: "Guide",
          educationalLevel: "professional",
          isAccessibleForFree: true,
        }}
      />
      <p className="sc-page-subtitle">SC LEARNING GUIDE</p>
      <h1 className="sc-page-title">情報処理安全確保支援士試験 学習ガイド</h1>
      <p className="sc-page-lead">{DESCRIPTION}</p>

      <nav aria-label="目次" className="sc-toc">
        <p className="sc-toc-label">CONTENTS</p>
        <div className="sc-toc-list">
          {SC_GUIDE.map((c) => (
            <a key={c.id} href={`#${c.id}`}>{c.heading}</a>
          ))}
        </div>
      </nav>

      {SC_GUIDE.map((c) => (
        <section key={c.id} id={c.id} className="sc-chapter">
          <h2>{c.heading}</h2>
          <div className="sc-chapter-body">{c.body}</div>
        </section>
      ))}

      <p className="sc-footnote">
        ← <Link href="/sc">情報処理安全確保支援士試験 のトップ</Link>
        {" ・ "}
        <Link href="/sc/faq">FAQ を見る</Link>
      </p>
    </ScPageFrame>
  )
}
