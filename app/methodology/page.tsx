import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { JsonLd } from "@/components/seo/JsonLd"
import { SITE_NAME, SITE_URL } from "@/lib/seo/structured-data"

const TITLE = "解説の編集方針 / 品質保証フロー — 合格.dev"
const DESCRIPTION =
  "合格.dev の過去問解説・ヒント・図表の編集方針、出典の取り扱い方、誤り発見時の修正フロー、正答率データの算出方法をまとめた品質保証のための説明ページ。"

export const metadata: Metadata = makeMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/methodology",
  type: "article",
})

export default function MethodologyPage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "編集方針", href: "/methodology" },
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
          url: `${SITE_URL}/methodology`,
        }}
      />
      <h1 className="text-[22px] font-extrabold mb-3 leading-[1.4]">
        編集方針・品質保証フロー
      </h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/80 mb-7">
        合格.dev で公開している過去問解説・ヒント・図表・タグ・分類は、すべて当サイトの編集チームが独自に制作したオリジナルです。本ページでは、解説の品質を担保するために採用している編集方針と、誤り発見時の修正フローを公開します。
      </p>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2 mt-1">問題本文の取り扱い</h2>
        <p className="mb-3">
          問題文・選択肢は、独立行政法人情報処理推進機構(IPA)および 一般財団法人不動産適正取引推進機構が公表する 過去問題 に基づきます。原文の表現は可能な限り保持していますが、明らかな OCR 誤りや図表の崩れは整形しています。
        </p>
        <p className="mb-3">
          数式は KaTeX による LaTeX 形式に書き起こし、Retina ディスプレイでも文字が滲まないベクター描画にしています。表形式の問題は Markdown テーブルに再構築しています。図形やフローチャートは、可能な範囲で SVG に作り直しています。
        </p>
      </section>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2">解説の編集ポリシー</h2>
        <p className="mb-3">
          各問題には 「全体解説」 と 「選択肢ごとの解説」 を用意しています。全体解説は、出題の背景知識と正答に至る論理を 100〜400 字程度で説明します。選択肢ごとの解説は、各選択肢がなぜ正解 / 不正解かを 1〜2 文で明示し、引っかけパターンを言語化します。
        </p>
        <p className="mb-3">
          解説の執筆は、(1) 過去問の出題テーマを公式試験要綱と照合、(2) 公的に信頼できる一次資料(IPA、JIS、ISO、内閣府、関連省庁)で事実関係を確認、(3) 読者の前提知識を想定して用語を補足、(4) 編集担当の相互レビュー、の 4 段階で行います。
        </p>
        <p className="mb-3">
          ヒント機能(IT パスポート試験の問題に付属)は、解答に直接結びつく情報ではなく、用語の周辺知識や典型的な引っかけパターンを示すものです。最初に解いた段階では使わず、復習で見返す用途を想定しています。
        </p>
      </section>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2">タグ・分類の付与方針</h2>
        <p className="mb-3">
          各問題には複数のタグ(分野キーワード)を付与しています。タグは、IPA の試験要綱に記載された分野名と、出題内容から自然に導かれるトピック名(例: SQL、TCP/IP、SWOT 分析)の両方を採用しています。
        </p>
        <p className="mb-3">
          大分類(ストラテジ系 / マネジメント系 / テクノロジ系) は、試験要綱の区分に従い機械的に判別します。タグ → 大分類のマッピングは <Link href="/methodology" className="underline">本ページ</Link> でメンテナンスし、出題傾向の変化に応じて見直します。
        </p>
      </section>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2">合格率・正答率データ</h2>
        <p className="mb-3">
          各試験の合格率は、IPA・不動産適正取引推進機構が公表する公式統計を出典としています。本サイトでは数値の改ざんは行わず、年度ごとに公式発表をそのまま記載します。年度をまたいだ集計や移動平均は採用していません。
        </p>
        <p className="mb-3">
          各問題ページに表示される正答率は、本サイト上で同問題を解答したユーザーの集計値です。試験本番の正答率ではないため、難易度の絶対的な指標としては扱わず、目安として参考にしてください。
        </p>
      </section>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2">誤り発見時の修正フロー</h2>
        <p className="mb-3">
          解説や図表に誤りを見つけた方は、各問題ページの「問題を報告」または <Link href="/contact" className="underline">お問い合わせフォーム</Link> からご報告ください。報告いただいた内容は以下の流れで確認・修正します。
        </p>
        <ol className="list-decimal pl-5 mb-3 space-y-1">
          <li>受領 24 時間以内に内容を確認(土日祝を除く)</li>
          <li>事実誤認の場合は 3 営業日以内に修正・公開</li>
          <li>解釈の幅がある場合は、判断根拠を含めて返信し相談</li>
          <li>修正版は、公開日時の更新と合わせて掲載</li>
        </ol>
        <p className="mb-3">
          ご報告いただいた方への謝礼は現在用意していませんが、改善内容は他の利用者にも届きます。建設的な指摘に感謝します。
        </p>
      </section>

      <section className="mb-7 text-[13px] leading-[1.9] text-goukaku-ink/85">
        <h2 className="text-[16px] font-extrabold mb-2">広告・利益相反の開示</h2>
        <p className="mb-3">
          合格.dev は現在、広告掲載を行っていません。問題の選定・解説の内容は、外部の広告主・スポンサーから影響を受けることはありません。記事内に外部の通信教育や参考書を紹介する場合がありますが、リンク先からの収益 (アフィリエイト) は受け取らない方針です。
        </p>
      </section>

      <p className="text-[11px] opacity-60 pt-3 border-t border-goukaku-divider">
        関連: <Link href="/sources" className="underline">出典・参考文献</Link> ・{" "}
        <Link href="/about" className="underline">合格.dev について</Link> ・{" "}
        <Link href="/privacy" className="underline">プライバシーポリシー</Link> ・{" "}
        <Link href="/contact" className="underline">お問い合わせ</Link>
      </p>
    </MobileFrame>
  )
}
