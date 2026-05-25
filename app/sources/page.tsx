import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { JsonLd } from "@/components/seo/JsonLd"
import { SITE_NAME, SITE_URL } from "@/lib/seo/structured-data"

const TITLE = "出典・参考文献 — 合格.dev"
const DESCRIPTION =
  "合格.dev に掲載している過去問題の出典、合格率・統計データの参照元、関連条文・判例の出典をまとめた参考文献ページ。IPA・不動産適正取引推進機構ほか、信頼できる一次資料の所在を明示。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/sources",
  type: "article",
})

export default function SourcesPage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "出典・参考文献", href: "/sources" },
      ]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: { "@type": "Organization", name: SITE_NAME },
          inLanguage: "ja",
          url: `${SITE_URL}/sources`,
        }}
      />
      <h1 className="text-[22px] font-extrabold mb-3 leading-[1.4]">
        出典・参考文献
      </h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/80 mb-7">
        本サイトに掲載している過去問題、合格率・統計、関連条文の出典をまとめます。問題本文・選択肢の著作権は各実施団体に帰属し、本サイトはこれらの過去問題を、学習用途の引用として再構成・解説しています。
      </p>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2">情報処理技術者試験(IT パスポート / 基本情報技術者)</h2>
        <p className="mb-3">
          独立行政法人情報処理推進機構(IPA)が公表する過去問題を出典としています。
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>
            <a href="https://www.ipa.go.jp/shiken/" target="_blank" rel="noopener noreferrer" className="underline">
              IPA 情報処理技術者試験・情報処理安全確保支援士試験
            </a>{" "}
            — 試験要綱・公表問題・統計データの一次資料
          </li>
          <li>
            <a href="https://www3.jitec.ipa.go.jp/JitesCbt/index.html" target="_blank" rel="noopener noreferrer" className="underline">
              CBT 申込システム
            </a>{" "}
            — 受験申込み・日程変更の公式窓口
          </li>
          <li>
            <a href="https://www.ipa.go.jp/shiken/syllabus/" target="_blank" rel="noopener noreferrer" className="underline">
              シラバス(出題範囲)
            </a>{" "}
            — 各試験区分の正式な出題範囲定義
          </li>
        </ul>
      </section>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2">宅地建物取引士試験</h2>
        <p className="mb-3">
          一般財団法人不動産適正取引推進機構(RETIO)が公表する過去問題を出典としています。
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>
            <a href="https://www.retio.or.jp/exam/" target="_blank" rel="noopener noreferrer" className="underline">
              RETIO 宅地建物取引士資格試験
            </a>{" "}
            — 試験概要・過去 5 年分の試験問題・合格基準・統計データの一次資料
          </li>
        </ul>
        <p className="mb-3">
          関連条文・判例については、以下を主たる参考としています(個別の問題ページに条文番号を併記しています)。
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>e-Gov 法令検索 — 民法、宅地建物取引業法、借地借家法、区分所有法、都市計画法、建築基準法 ほか</li>
          <li>裁判所 判例検索 — 民法・宅建業法に関する重要判例</li>
        </ul>
      </section>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2">関連法規・標準規格(IT 系)</h2>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>JIS Q 27000 シリーズ(情報セキュリティマネジメント)</li>
          <li>JIS Q 20000 シリーズ(IT サービスマネジメント)</li>
          <li>JIS X 0001 ほか(情報処理用語)</li>
          <li>個人情報の保護に関する法律(個人情報保護法)、不正アクセス禁止法、著作権法、特定商取引法 等</li>
          <li>PMBOK Guide(プロジェクトマネジメント)、ITIL(IT サービスマネジメント)</li>
          <li>OWASP Top 10、CIS Controls 等のセキュリティガイドライン</li>
        </ul>
      </section>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2">著作権の取り扱い</h2>
        <p className="mb-3">
          過去問題の著作権は各試験実施団体に帰属します。本サイトでの過去問題の掲載は、学習用途の引用として(著作権法 第 32 条 引用の要件を満たす形で)行っています。
        </p>
        <p className="mb-3">
          解説・図表・タグ・分類・ヒント・関連条文情報は、本サイトの編集チームが独自に制作したオリジナルです。これらの二次的著作物の著作権は合格.dev に帰属します。
        </p>
        <p className="mb-3">
          各団体からの掲載差止の申し立てや、本サイトの掲載方針に関するご相談は{" "}
          <Link href="/contact" className="underline">お問い合わせフォーム</Link> までご連絡ください。
        </p>
      </section>

      <p className="text-[11px] opacity-60 pt-3 border-t border-goukaku-divider">
        関連: <Link href="/methodology" className="underline">編集方針</Link> ・{" "}
        <Link href="/about" className="underline">合格.dev について</Link> ・{" "}
        <Link href="/privacy" className="underline">プライバシーポリシー</Link>
      </p>
    </MobileFrame>
  )
}
