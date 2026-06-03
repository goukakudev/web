import type { Metadata } from "next"
import Link from "next/link"
import { listKnExams } from "@/lib/kango/api"
import { shortLabel } from "@/lib/kango/exam"
import { makeMetadata } from "@/lib/seo/metadata"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbJsonLd, courseJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { KangoNav, KangoBreadcrumb } from "@/components/kango/KangoNav"

export const metadata: Metadata = makeMetadata({
  title: "看護師国家試験の学習ガイド",
  description:
    "看護師国家試験の出題構成(必修・一般・状況設定)と合格基準、計算問題・状況設定問題の対策、過去問の効果的な使い方を解説。保健師・助産師国家試験にも対応。",
  path: "/kango/guide",
})

export const revalidate = 86400

const H2 = { fontSize: 18, fontWeight: 800, color: "var(--color-kn-text-1)", margin: "26px 0 8px" } as const
const H3 = { fontSize: 15, fontWeight: 800, color: "var(--color-kn-text-1)", margin: "16px 0 6px" } as const
const P = { fontSize: 13.5, lineHeight: 1.95, color: "var(--color-kn-text-2)", margin: "0 0 10px" } as const

export default async function KangoGuidePage() {
  const exams = await listKnExams().catch(() => [])
  const totalQ = exams.reduce((s, e) => s + e.question_count, 0)
  const latest = exams[0]

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 48px" }}>
        <KangoBreadcrumb
          items={[
            { name: "合格.dev", href: "/" },
            { name: "看護", href: "/kango" },
            { name: "学習ガイド", href: "/kango/guide" },
          ]}
        />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "合格.dev", url: `${SITE_URL}/` },
            { name: "看護師国家試験 過去問", url: `${SITE_URL}/kango` },
            { name: "学習ガイド", url: `${SITE_URL}/kango/guide` },
          ])}
        />
        <JsonLd
          data={courseJsonLd({
            name: "看護師国家試験 過去問学習コース",
            description:
              "看護師・保健師・助産師 国家試験の過去問を、選択肢別解説つきで無料演習。必修・一般・状況設定問題、計算問題に対応。",
            url: `${SITE_URL}/kango`,
            aboutName: "看護師国家試験",
            totalQuestions: totalQ,
            credentialName: "看護師",
          })}
        />

        <header style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-kn-text-1)", margin: 0 }}>
            看護師国家試験の学習ガイド
          </h1>
          <p style={{ fontSize: 12.5, color: "var(--color-kn-text-3)", margin: "6px 0 0" }}>
            出題構成・合格基準・過去問の使い方
          </p>
        </header>

        <section>
          <p style={P}>
            看護師国家試験は、保健師助産師看護師法に基づき毎年1回(2月)実施される国家試験です。合格すると看護師免許の申請資格が得られます。本ガイドでは、出題の全体像と、過去問を使った効率的な学習法を解説します。
          </p>

          <h2 style={H2}>出題構成 — 必修・一般・状況設定</h2>
          <p style={P}>
            出題は大きく3種類に分かれます。<strong>必修問題</strong>は看護師として必ず押さえるべき基礎知識を問う問題で、例年50問出題され、<strong>80%(40問)以上</strong>が合格の絶対条件です。<strong>一般問題</strong>は各専門分野の知識を、<strong>状況設定問題</strong>は事例(患者の状態)を読み解いて複数問に答える応用問題です。
          </p>
          <h3 style={H3}>必修問題は取りこぼさない</h3>
          <p style={P}>
            必修問題は基準が高い(8割)ため、ここを落とすと一般・状況設定で高得点でも不合格になります。過去問で必修レベルの基礎(バイタルサイン、感染対策、医療安全、基本的な看護技術など)を繰り返し固めることが最優先です。
          </p>

          <h2 style={H2}>計算問題の対策</h2>
          <p style={P}>
            点滴の滴下数、薬剤の希釈・投与量、BMI やエネルギー必要量などの<strong>計算問題</strong>が出題されます。公式を覚えるだけでなく、単位(mL/分、滴/分、mg など)を意識して立式する練習が有効です。本サイトの計算問題は数値を直接入力して答え合わせができます。
          </p>

          <h2 style={H2}>状況設定問題の読み方</h2>
          <p style={P}>
            状況設定問題は、1つの事例に対して複数の設問が連なります。患者の年齢・疾患・経過・検査値などの条件を正確に拾い、各設問で「今この場面で優先すべきことは何か」を判断します。過去問で事例の型に慣れておくと、本番で素早く状況を整理できます。
          </p>

          <h2 style={H2}>過去問演習の進め方</h2>
          <p style={P}>
            まずは<strong>年度ごとに通し</strong>で解いて出題の傾向と時間配分をつかみ、次に<strong>ランダム出題</strong>で記憶の定着を確認するのがおすすめです。本サイトでは解答するとその場で正誤と解説が表示され、間違えた問題やお気に入りは端末内に記録されます。
          </p>
          {latest && (
            <Link
              href={`/kango/exam/${latest.exam_id}`}
              className="kn-btn-primary"
              style={{ marginTop: 6, textDecoration: "none" }}
            >
              {shortLabel(latest)}の過去問を見る ▶
            </Link>
          )}

          <h2 style={H2}>保健師・助産師国家試験</h2>
          <p style={P}>
            保健師・助産師の国家試験も看護師と同時期(2月)に実施されます。本サイトは
            {exams.length > 0 ? `現在 ${exams.length} 試験・${totalQ} 問` : "複数の試験"}を収録しており、
            トップページから試験を選んで演習できます。出題形式(択一・複数選択・計算・組合せ・状況設定)はいずれも本サイトのUIに対応しています。
          </p>
        </section>

        <footer style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--color-kn-line)" }}>
          <KangoNav current="/kango/guide" />
        </footer>
      </div>
    </main>
  )
}
