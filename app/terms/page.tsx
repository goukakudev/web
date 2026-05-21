import type { Metadata } from "next";
import Link from "next/link";
import { MobileFrame } from "@/components/layout/MobileFrame";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "合格.dev (Web / iOS アプリ) の利用規約。サービス内容、知的財産権、禁止事項、免責事項、第三者広告サービスについて明記します。",
  alternates: { canonical: "/terms" },
};

const REVISED = "2026-05-19";

export default function TermsPage() {
  return (
    <MobileFrame>
      <Link href="/" className="inline-block text-[14px] mb-4">
        ← ホーム
      </Link>
      <h1 className="text-[24px] font-extrabold mb-2">利用規約</h1>
      <p className="text-[12px] text-goukaku-ink/55 mb-6">最終更新日: {REVISED}</p>

      <Section title="第1条 (適用)">
        <p>
          本規約は、合格.dev (以下「当サイト」) および同名の iOS アプリ「合格.dev」(以下「本アプリ」) (両者を以下「本サービス」と総称) の利用に関する条件を、利用者と運営者との間で定めるものです。本サービスを利用した時点で、本規約に同意したものとみなします。
        </p>
      </Section>

      <Section title="第2条 (サービス内容)">
        <p>
          本サービスは、独立行政法人情報処理推進機構 (IPA) が公表する基本情報技術者試験等の過去問題を独自に編集・解説し、無料で閲覧・演習できる学習サービスです。
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>会員登録は不要で、誰でも自由に利用できます。</li>
          <li>提供する機能・コンテンツは予告なく変更・追加・削除されることがあります。</li>
          <li>本サービスは IPA との提携・後援関係はありません。</li>
        </ul>
      </Section>

      <Section title="第3条 (知的財産権)">
        <p>
          本サービスに掲載されている問題文は IPA が公表する過去問題に基づきます。IPA の方針により、過去問題の利用は許諾不要とされていますが、原著作物の著作権は IPA に帰属します。
        </p>
        <p className="mt-2">
          一方、解説文・図表 (Potrace でベクター化した独自加工版)・UI デザイン・タグ付け・分類・コードは、すべて当サイト運営者が独自に作成したものであり、その著作権は運営者に帰属します。
        </p>
        <p className="mt-2">
          無断での複製・転載・再配布・営利目的での使用はお断りします。引用は出典明記の上、引用の要件 (主従関係、必要最小限など) を満たす範囲で許諾します。
        </p>
      </Section>

      <Section title="第4条 (禁止事項)">
        <p>利用者は以下の行為を行ってはなりません。</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>本サービスの解説・図表・コード等を許諾なく複製・転載・販売する行為</li>
          <li>本サービスのサーバーに過度な負荷をかける行為 (スクレイピング、自動アクセス等)</li>
          <li>リバースエンジニアリング、逆コンパイル、その他の解析行為</li>
          <li>本サービスを通じて取得した情報を、第三者に有償・無償を問わず提供する行為</li>
          <li>本サービスの運営を妨害する行為、他の利用者の学習を妨げる行為</li>
          <li>法令または公序良俗に反する行為</li>
        </ul>
      </Section>

      <Section title="第5条 (第三者広告サービス)">
        <p>
          本サービスは、運営費捻出のため Google AdSense などの第三者広告配信サービスを利用することがあります。広告主・広告内容は Google 等のアルゴリズムにより自動的に決定されるものであり、運営者がその内容を保証するものではありません。広告内容に関する問題は、各広告配信事業者にお問い合わせください。
        </p>
        <p className="mt-2">
          詳細は{" "}
          <Link href="/privacy" className="underline">
            プライバシーポリシー
          </Link>{" "}
          をご確認ください。
        </p>
      </Section>

      <Section title="第6条 (免責事項)">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            本サービスに掲載する問題および解説は、内容の正確性・完全性・最新性を保証するものではありません。実際の試験対策は公式情報源も併せてご確認ください。
          </li>
          <li>
            本サービスの利用により利用者または第三者に生じたいかなる損害 (直接・間接・付随的・特別損害を含む) についても、運営者は責任を負いません。
          </li>
          <li>
            本サービスは予告なく中断・停止・終了することがあります。
          </li>
          <li>
            外部リンク先の内容について運営者は責任を負いません。
          </li>
        </ul>
      </Section>

      <Section title="第7条 (規約の変更)">
        <p>
          運営者は、必要と判断した場合には、利用者への事前通知なく本規約を変更できるものとします。変更後の規約は、本ページに掲示した時点から効力を生じます。利用者が変更後も本サービスを継続利用する場合、変更後の規約に同意したものとみなします。
        </p>
      </Section>

      <Section title="第8条 (準拠法・管轄)">
        <p>
          本規約は日本法を準拠法とします。本サービスに関連して紛争が生じた場合、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </Section>

      <Section title="第9条 (お問い合わせ)">
        <p>
          本規約に関するお問い合わせは{" "}
          <Link href="/contact" className="underline">
            お問い合わせページ
          </Link>{" "}
          からお願いします。
        </p>
      </Section>
    </MobileFrame>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 text-[13px] leading-[1.8]">
      <h2 className="text-[16px] font-extrabold mb-2">{title}</h2>
      <div className="text-goukaku-ink/85">{children}</div>
    </section>
  );
}
