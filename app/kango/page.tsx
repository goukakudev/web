import type { Metadata } from "next"
import Link from "next/link"
import { listKnExams } from "@/lib/kango/api"
import { groupExams, shortLabel, typeColor, roundNumber, displayTitle } from "@/lib/kango/exam"
import { KangoLogo, Eyebrow } from "@/components/kango/ui"
import { KangoHomeStats } from "@/components/kango/KangoHomeStats"
import { KangoNav } from "@/components/kango/KangoNav"
import { JsonLd } from "@/components/seo/JsonLd"
import { courseJsonLd, webPageJsonLd, itemListJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { KANGO_CATEGORIES } from "@/lib/kango/categories"
import { makeMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const exams = await listKnExams()
  const total = exams.reduce((sum, exam) => sum + exam.question_count, 0)
  const totalText = total > 0 ? `全${total.toLocaleString("ja-JP")}問` : ""
  return makeMetadata({
    title: "看護師国家試験 過去問 無料 第115回 選択肢別解説・必修対応",
    description:
      `無料・登録不要・スマホ最適化。看護師国家試験(保健師・助産師含む)の過去問を第115回ほか${totalText}収録。必修・一般・状況設定・計算問題に対応し、独自の選択肢別解説付き。`,
    path: "/kango",
  })
}

export const revalidate = 3600

export default async function KangoHome() {
  const exams = await listKnExams()
  const totalQ = exams.reduce((s, e) => s + e.question_count, 0)
  const groups = groupExams(exams)
  const latest = exams[0]

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 48px" }}>
        <JsonLd
          data={webPageJsonLd({
            name: "看護師国家試験 過去問",
            url: `${SITE_URL}/kango`,
            description: "看護師・保健師・助産師 国家試験の過去問を、選択肢別解説つきで無料演習。",
          })}
        />
        <JsonLd
          data={courseJsonLd({
            name: "看護師国家試験 過去問学習コース",
            description: "看護師・保健師・助産師 国家試験の過去問を選択肢別解説つきで無料演習。必修・一般・状況設定・計算問題に対応。",
            url: `${SITE_URL}/kango`,
            aboutName: "看護師国家試験",
            totalQuestions: totalQ,
            credentialName: "看護師",
          })}
        />
        <JsonLd
          data={itemListJsonLd(
            exams.map((e) => ({ name: `${displayTitle(e)} 過去問`, url: `${SITE_URL}/kango/exam/${e.exam_id}` })),
          )}
        />
        {/* トップバー */}
        <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <KangoLogo size={36} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-kn-text-1)", margin: 0 }}>看護師過去問</h1>
        </header>

        {/* ヒーロー */}
        <div className="kn-card" style={{ padding: 20, marginBottom: 16 }}>
          <Eyebrow>収録状況</Eyebrow>
          <p style={{ fontSize: 28, fontWeight: 800, color: "var(--color-kn-text-1)", margin: "8px 0 2px" }}>
            {exams.length}試験・{totalQ}問
          </p>
          <p style={{ fontSize: 13.5, color: "var(--color-kn-text-2)", margin: 0 }}>
            看護師・保健師・助産師 国家試験の過去問を、選択肢別解説付きで。
          </p>
          {latest && (
            <Link
              href={`/kango/play/${latest.exam_id}`}
              className="kn-btn-primary"
              style={{ marginTop: 16, textDecoration: "none" }}
            >
              {shortLabel(latest)}から始める ▶
            </Link>
          )}
        </div>

        {/* 学習サマリ (client) */}
        <KangoHomeStats />

        {/* 試験一覧 */}
        {groups.map((g) => (
          <section key={g.type} style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-kn-text-1)", marginBottom: 10 }}>
              {g.type}国家試験
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {g.exams.map((e) => (
                <div key={e.exam_id} className="kn-card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        flex: "none",
                        display: "grid",
                        placeItems: "center",
                        background: `color-mix(in srgb, ${typeColor(e.exam_id)} 14%, transparent)`,
                        color: typeColor(e.exam_id),
                        fontWeight: 800,
                        fontSize: 17,
                      }}
                    >
                      {roundNumber(e.exam_id)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <Link
                        href={`/kango/exam/${e.exam_id}`}
                        style={{ fontSize: 15, fontWeight: 800, color: "var(--color-kn-text-1)", textDecoration: "none" }}
                      >
                        {shortLabel(e)}
                      </Link>
                      <div style={{ fontSize: 12, color: "var(--color-kn-text-3)" }}>全{e.question_count}問</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <Link
                      href={`/kango/play/${e.exam_id}`}
                      className="kn-btn-primary"
                      style={{ minHeight: 44, fontSize: 14, textDecoration: "none" }}
                    >
                      順番に解く
                    </Link>
                    <Link
                      href={`/kango/play/${e.exam_id}?mode=random`}
                      className="kn-btn-ghost"
                      style={{ minHeight: 44, fontSize: 14, textDecoration: "none" }}
                    >
                      ランダム20問
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* 分野から探す */}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-kn-text-1)", marginBottom: 12 }}>分野から探す</h2>
          {(["看護師", "助産師", "保健師"] as const).map((t) => {
            const cats = KANGO_CATEGORIES.filter((c) => c.examType === t)
            if (!cats.length) return null
            return (
              <div key={t} style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-kn-text-3)", margin: "0 0 8px" }}>{t}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {cats.map((c) => (
                    <Link key={c.slug} href={`/kango/category/${c.slug}`} className="kn-chip" style={{ textDecoration: "none" }}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        {/* about (SEO) */}
        <section style={{ marginTop: 32, fontSize: 13, lineHeight: 1.85, color: "var(--color-kn-text-2)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-kn-text-1)", marginBottom: 10 }}>
            看護師国家試験の過去問演習について
          </h2>
          <p style={{ margin: "0 0 12px" }}>
            合格.dev の看護過去問は、看護師・保健師・助産師の国家試験を無料で演習できる学習ページです。第115回ほかの過去問を、選択肢ごとの解説付きで収録しています。数字選択・複数選択・計算・組合せ・状況設定・図表問題に対応し、本番に近い形式で解けます。
          </p>
          <p style={{ margin: "0 0 12px" }}>
            解答するとその場で正誤と解説が表示され、学習記録（正解率・連続正解・学習日数）は端末内に保存されます。
          </p>

          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-kn-text-1)", margin: "18px 0 8px" }}>
            この試験をはじめて受ける方へ
          </h3>
          <p style={{ margin: "0 0 10px" }}>
            看護師国家試験の出題構成 (必修・一般・状況設定)、合格基準、計算問題の対策、過去問の効果的な使い方をまとめた<strong>独自編集の学習ガイド</strong>を用意しています。これから受験を検討する段階の方は、まずこちらをご覧ください。
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0 18px" }}>
            <Link
              href="/kango/guide"
              className="kn-chip"
              style={{ textDecoration: "none" }}
            >
              📘 看護 学習ガイドを読む →
            </Link>
            <Link
              href="/kango/faq"
              className="kn-chip"
              style={{ textDecoration: "none" }}
            >
              ❓ 看護 FAQ
            </Link>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-kn-text-1)", margin: "18px 0 8px" }}>
            コンテンツの独自性について
          </h3>
          <p style={{ margin: "0 0 10px" }}>
            問題文・選択肢・正解番号は、<strong>厚生労働省</strong>が公表する看護師・保健師・助産師の国家試験 過去問題に基づきます (引用)。一方で、各問題の<strong>解説・選択肢別解説・ヒント・分野タグ・関連問題リンク</strong>、および本サイト内の学習ガイド・FAQ・本ページの解説文章は、すべて合格.dev 編集部が独自に書き起こした<strong>二次著作物</strong>です。公式見解を示すものではありません。生成 AI による下書きは補助的に用いる場合がありますが、最終的な公開コンテンツはすべて人手で校正しています。
          </p>
          <p style={{ margin: 0 }}>
            詳しくは{" "}
            <Link href="/about" style={{ textDecoration: "underline", color: "var(--color-kn-primary-text)" }}>About</Link>
            {" / "}
            <Link href="/methodology" style={{ textDecoration: "underline", color: "var(--color-kn-primary-text)" }}>編集方針 (詳細)</Link>
            {" / "}
            <Link href="/sources" style={{ textDecoration: "underline", color: "var(--color-kn-primary-text)" }}>出典一覧</Link>
            {" / "}
            <Link href="/privacy" style={{ textDecoration: "underline", color: "var(--color-kn-primary-text)" }}>プライバシーポリシー</Link>
            {" / "}
            <Link href="/terms" style={{ textDecoration: "underline", color: "var(--color-kn-primary-text)" }}>利用規約</Link>
            {" "}をご覧ください。
          </p>
        </section>

        <footer style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--color-kn-line)" }}>
          <KangoNav current="/kango" />
        </footer>
      </div>
    </main>
  )
}
