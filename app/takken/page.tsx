import Link from "next/link";
import type { Metadata } from "next";
import { TakkenAPI } from "@/lib/takken/api";
import { makeMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd, SITE_URL, webPageJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { TakkenSectionNav } from "@/components/layout/TakkenSectionNav";

export const metadata: Metadata = makeMetadata({
  title: "宅建士 過去問",
  description: "宅地建物取引士(宅建士)試験の過去問演習サイト。H16〜R7 の全試験・1,200 問以上を解説付きで掲載。関連条文・判例タップで本文ポップアップ表示。",
  path: "/takken",
});

export default async function TakkenHome() {
  const exams = await TakkenAPI.listExams();
  const latest = exams[0];

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Breadcrumbs items={[
          { name: "合格.dev", href: "/" },
          { name: "宅建", href: "/takken" },
        ]} />
        <JsonLd data={webPageJsonLd({
          name: "宅地建物取引士 過去問",
          url: "https://goukaku.dev/takken",
          description: "宅地建物取引士(宅建士)試験の過去問演習サイト。H16〜R7 の全試験を解説付きで。",
        })} />
        <JsonLd data={itemListJsonLd(
          exams.map((e) => ({
            name: `${e.label} 宅建過去問`,
            url: `${SITE_URL}/takken/exams/${e.exam_id}`,
          })),
        )} />

        <header className="mb-10">
          <h1 className="font-mincho text-4xl font-semibold tracking-wide text-ink">
            宅建過去問
          </h1>
          <p className="mt-2 text-xs tracking-widest text-ink-3">
            宅地建物取引士試験対策
          </p>
        </header>

        {/* Hero */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-charcoal p-6 text-white">
          <p className="text-[10px] font-medium tracking-widest text-white/55">
            学習の進捗
          </p>
          <p className="mt-2 font-mincho text-2xl font-medium">
            {exams.length}試験・{exams.reduce((s, e) => s + e.question_count, 0)}問収録
          </p>
          <p className="mt-1 text-sm text-white/70">
            H16〜{latest?.label ?? "R7"} までの全試験
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          {latest && (
            <Link
              href={`/takken/exams/${latest.exam_id}`}
              className="btn-primary w-full"
            >
              最新年度から始める ({latest.label})
            </Link>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/takken/exams" className="btn-secondary">
              年度別に学習
            </Link>
            <Link href="/takken/categories" className="btn-secondary">
              分野別に学習
            </Link>
          </div>
        </div>

        <section className="mt-12 text-[13px] leading-[1.85] text-ink-2">
          <h2 className="font-mincho text-lg font-semibold text-ink mb-3">
            合格.dev について
          </h2>
          <p className="mb-3">
            合格.dev は、宅地建物取引士(宅建士)試験の過去問を無料で演習できる学習サイトです。<strong>H16(2004 年)〜 R7(2025 年)</strong> までの全試験を、関連条文・判例タップで本文ポップアップ表示できる UI で学習できます。
          </p>
          <h3 className="font-mincho text-base font-semibold text-ink mt-5 mb-2">
            関連条文・判例ポップアップ
          </h3>
          <p className="mb-3">
            問題文中の条文番号や判例参照箇所をタップすると、本文がオーバーレイ表示されます。条文集を別タブで開く必要がなく、解答中の流れを切らさずに参照できます。
          </p>
          <h3 className="font-mincho text-base font-semibold text-ink mt-5 mb-2">
            分野別 / 年度別の 2 視点
          </h3>
          <p className="mb-3">
            <strong>権利関係 / 宅建業法 / 法令上の制限 / 税その他</strong> の 4 分野で横断学習するか、年度ごとに通し演習(模試モード)するか選べます。各問題には独自編集の解説を順次整備中です。
          </p>
          <h3 className="font-mincho text-base font-semibold text-ink mt-5 mb-2">
            学習の進め方
          </h3>
          <p className="mb-3">
            初学者の方は、まず最新年度の <Link href={`/takken/exams/${latest?.exam_id ?? "R6-10"}`} className="underline">{latest?.label ?? "令和7年(2025年)10月"} 過去問</Link> を順番に解いて出題形式に慣れることをおすすめします。
            分野ごとに弱点を補強する場合は <Link href="/takken/categories" className="underline">分野別ページ</Link> から
            権利関係 ・ 宅建業法 ・ 法令上の制限 ・ 税その他 を選択できます。
            本番直前の仕上げには、各年度の <strong>模試モード</strong>（50 問・2 時間）で本番形式の通し演習が可能です。
          </p>
          <h3 className="font-mincho text-base font-semibold text-ink mt-5 mb-2">
            宅建試験について
          </h3>
          <p className="mb-3">
            宅地建物取引士 (宅建士) は、不動産取引における重要事項説明・契約書面への記名押印など、宅地建物取引業法上の独占業務を担う国家資格です。
            合格率は例年 15〜18% 前後で、毎年 10 月 (および一部年度は 12 月) に試験が実施されます。
            出題は <strong>権利関係 (民法・借地借家法等 14 問)</strong>、
            <strong>法令上の制限 (都市計画法・建築基準法等 8 問)</strong>、
            <strong>宅建業法 (20 問)</strong>、
            <strong>税その他 (8 問)</strong> の計 50 問・四肢択一形式です。
          </p>
          <h3 className="font-mincho text-base font-semibold text-ink mt-5 mb-2">
            出典について
          </h3>
          <p className="mb-3">
            掲載問題は、一般財団法人不動産適正取引推進機構が公表する宅地建物取引士試験の過去問題に基づきます。解説・UI は本サイト独自の編集物であり、公式見解を示すものではありません。詳しくは{" "}
            <Link href="/about" className="underline">About</Link>{" "}
            ・{" "}
            <Link href="/privacy" className="underline">プライバシーポリシー</Link>{" "}
            ・{" "}
            <Link href="/terms" className="underline">利用規約</Link>{" "}
            をご覧ください。
          </p>
        </section>

        <footer className="mt-16 border-t border-line pt-6 text-xs text-ink-3">
          <div className="mb-6">
            <TakkenSectionNav />
          </div>
          <p className="text-center">過去問データは公式公開問題に基づく。解説は学習用参考表記。</p>
        </footer>
      </div>
    </main>
  );
}
