import type { Metadata } from "next";
import Link from "next/link";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { listExams, listIpExams } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "合格.dev について",
  description:
    "独学でも合格できる。合格から、人生を変えられる。合格.dev は ITパスポート / 基本情報技術者試験 / 宅地建物取引士などの過去問を無料で学べる、資格挑戦者のための学習プラットフォームです。",
  alternates: { canonical: "/about" },
};

const COMPANY_NAME = "合格.dev";

type Catalog = {
  slug: string;
  name: string;
  short: string;
  description: string;
};

const CATALOG: Catalog[] = [
  {
    slug: "/ip",
    name: "ITパスポート試験",
    short: "IT Passport",
    description:
      "29 年分・約 2,900 問の公開過去問を、解説・ヒント・選択肢ごとの正誤判定付きで掲載しています。完全無料・登録不要で、苦手分野や時代別の出題傾向を一気に確認できます。",
  },
  {
    slug: "/fe",
    name: "基本情報技術者試験",
    short: "Fundamental IT Engineer",
    description:
      "平成 25 年から最新年度までの午前過去問を全問解説付きで掲載しています。順番に解く / ランダム / 90 分模試の 3 モードで、本試験を想定した演習が可能です。",
  },
  {
    slug: "/takken",
    name: "宅地建物取引士",
    short: "Real Estate Transaction Agent",
    description:
      "宅建の過去問を、関連条文・判例タップで本文ポップアップ表示できる UI で学習できます。読みやすさを重視したミニマルな和風モダンデザインです。",
  },
];

export default async function AboutPage() {
  let feCount = 0;
  let ipCount = 0;
  try {
    const exams = await listExams();
    feCount = exams.reduce((s, e) => s + e.question_count, 0);
  } catch {
    // fall through with zero — page should still render
  }
  try {
    const ipExams = await listIpExams();
    ipCount = ipExams.reduce((s, e) => s + e.question_count, 0);
  } catch {
    // fall through with zero — page should still render
  }

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "合格.dev について", href: "/about" },
      ]} />
      <h1 className="text-[24px] font-extrabold mb-4">{COMPANY_NAME} について</h1>

      <section className="mb-7 rounded-3xl border border-goukaku-divider bg-goukaku-surface p-5">
        <p className="text-[11px] font-bold tracking-[0.18em] text-goukaku-ink/50">
          MISSION
        </p>
        <p className="mt-3 text-[24px] font-black leading-[1.35] tracking-[-0.04em]">
          <span className="block">独学でも、合格できる。</span>
          <span className="block">合格から、人生を変えられる。</span>
        </p>
        <p className="mt-4 text-[13px] leading-[1.8] text-goukaku-ink/75">
          {COMPANY_NAME}{" "}
          は、独学で資格に挑む人を中心に、質の高い過去問・解説・ヒントを届けます。合格をゴールで終わらせず、仕事・暮らし・学び直しの先にある人生の選択肢を広げられる社会を目指して、ITパスポート、基本情報技術者試験、宅地建物取引士などの過去問学習体験を作っています。
        </p>
      </section>

      <Section title="このサイトは">
        <p>
          独学で資格試験に挑む人のために、公的に公表されている過去問題を、ブラウザだけで快適に解ける形に整えたサイトです。サインアップ不要、広告は控えめ。学習履歴はあなたのブラウザの中だけ ({" "}
          <Link href="/privacy" className="underline">
            プライバシーポリシー
          </Link>
          ) に保存されます。
        </p>
      </Section>

      <Section title="取り扱っている試験">
        <ul className="space-y-3">
          {CATALOG.map((c) => (
            <li key={c.slug}>
              <Link
                href={c.slug}
                className="block rounded-2xl border border-goukaku-divider bg-goukaku-surface p-4"
              >
                <p className="text-[14px] font-extrabold">{c.name}</p>
                <p className="text-[11px] opacity-60 mt-0.5">{c.short}</p>
                <p className="text-[12px] leading-relaxed mt-2 text-goukaku-ink/80">
                  {c.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="掲載量 (公開済)">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            ITパスポート: <strong>{ipCount.toLocaleString()}</strong> 問
          </li>
          <li>
            基本情報技術者: <strong>{feCount.toLocaleString()}</strong> 問
          </li>
          <li>宅地建物取引士: 過去 21 年分の公表問題を順次拡充中</li>
          <li>全問に総評と選択肢ごとの解説を順次整備</li>
        </ul>
      </Section>

      <Section title="3 つの学習モード">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>順番に解く</strong>: 第 1 問から順に。問題ごとに独立した URL があり、ブックマーク・シェアもできます。
          </li>
          <li>
            <strong>ランダムに解く</strong>: 出題順をシャッフル。本番直前の総ざらいに。
          </li>
          <li>
            <strong>模試モード</strong>: 本試験と同じ制限時間で、正答率と所要時間をレポートします。
          </li>
        </ul>
      </Section>

      <Section title="数式と表の表示">
        <p>
          KaTeX による数式描画と Markdown テーブルの整形表示に対応。指数・分数・行列も読みやすい形でレンダリングされます。
        </p>
      </Section>

      <Section title="解説とヒントについて">
        <p>
          {COMPANY_NAME}{" "}
          の解説・ヒント・タグ・分類は当サイト独自の編集物です。試験団体の公式見解ではありません。誤りや改善案を見つけた方は、各問題画面の「問題を報告」または{" "}
          <Link href="/contact" className="underline">
            お問い合わせ
          </Link>{" "}
          からお知らせください。
        </p>
      </Section>

      <Section title="出典と著作権">
        <p>
          問題文・選択肢は、独立行政法人情報処理推進機構 (IPA) または一般財団法人不動産適正取引推進機構が公表する過去問題を元にしています。引用に関するご指摘は{" "}
          <Link href="/contact" className="underline">
            お問い合わせ
          </Link>{" "}
          までお願いします。
        </p>
      </Section>

      <Section title="運営">
        <p>運営: {COMPANY_NAME}</p>
        <p className="mt-2">
          <Link href="/contact" className="underline">
            お問い合わせ
          </Link>
          {" / "}
          <Link href="/privacy" className="underline">
            プライバシーポリシー
          </Link>
          {" / "}
          <Link href="/terms" className="underline">
            利用規約
          </Link>
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
