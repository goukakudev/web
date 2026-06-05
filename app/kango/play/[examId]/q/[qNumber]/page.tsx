import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { listKnQuestions, getKnExam } from "@/lib/kango/api"
import {
  displayTitle,
  shortLabel,
  typeColor,
  correctLabels,
  correctDisplay,
  isUnscored,
  formatTag,
} from "@/lib/kango/exam"
import { categoryBySlug } from "@/lib/kango/categories"
import { makeMetadata } from "@/lib/seo/metadata"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbJsonLd, questionJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { KangoNav, KangoBreadcrumb } from "@/components/kango/KangoNav"
import { stripMd } from "@/lib/text-utils"

export const revalidate = 86400

interface PageProps {
  params: Promise<{ examId: string; qNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId, qNumber } = await params
  const n = Number(qNumber)
  if (!Number.isInteger(n) || n < 1) return {}
  const [questions, exam] = await Promise.all([
    listKnQuestions(examId).catch(() => []),
    getKnExam(examId).catch(() => undefined),
  ])
  const q = questions.find((x) => x.q_number === n)
  if (!exam || !q) return {}
  const t = displayTitle(exam)
  const preview = stripMd(q.body).slice(0, 80)
  return makeMetadata({
    title: `${t} 問${n}：${preview}`,
    description: `${t} 問${n} の問題文・選択肢・正解・選択肢別解説。${preview}…`,
    path: `/kango/play/${examId}/q/${n}`,
    type: "article",
  })
}

export default async function KangoPlayQuestionPage({ params }: PageProps) {
  const { examId, qNumber } = await params
  const n = Number(qNumber)
  if (!Number.isInteger(n) || n < 1) notFound()

  const [questions, exam] = await Promise.all([
    listKnQuestions(examId).catch(() => []),
    getKnExam(examId).catch(() => undefined),
  ])
  if (!exam || !questions.length) notFound()
  const idx = questions.findIndex((x) => x.q_number === n)
  if (idx < 0) notFound()
  const q = questions[idx]
  const prev = idx > 0 ? questions[idx - 1] : null
  const next = idx < questions.length - 1 ? questions[idx + 1] : null

  // 関連問題（同分野）: 同じタグ/カテゴリの問題への内部リンク。fe/ip/ap/sg の RelatedQuestions と
  // 同趣旨で、クロール導線とトピッククラスタを強化する。このページは完全 SSR なので client payload には影響しない。
  const currentTags = new Set(q.tags ?? [])
  const related = questions
    .filter((x) => x.q_number !== q.q_number)
    .map((x) => {
      const tagOverlap = (x.tags ?? []).filter((tg) => currentTags.has(tg)).length
      const catMatch = q.category && x.category === q.category ? 1 : 0
      return { x, score: tagOverlap * 2 + catMatch }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.x.q_number - b.x.q_number)
    .slice(0, 5)
    .map((r) => r.x)

  const t = displayTitle(exam)
  const accent = typeColor(examId)
  const labels = correctLabels(q.correct)
  const unscored = isUnscored(q)
  const tag = formatTag(q)
  const cat = q.category ? categoryBySlug(q.category) : undefined
  const url = `${SITE_URL}/kango/play/${examId}/q/${n}`
  const examUrl = `/kango/exam/${examId}`

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 48px" }}>
        <KangoBreadcrumb
          items={[
            { name: "合格.dev", href: "/" },
            { name: "看護", href: "/kango" },
            { name: shortLabel(exam), href: examUrl },
            { name: `問${q.q_number}`, href: `/kango/play/${examId}/q/${n}` },
          ]}
        />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "合格.dev", url: `${SITE_URL}/` },
            { name: "看護師国家試験 過去問", url: `${SITE_URL}/kango` },
            { name: shortLabel(exam), url: `${SITE_URL}${examUrl}` },
            { name: `問${q.q_number}`, url },
          ])}
        />
        {q.choices && q.choices.length > 0 && (
          <JsonLd
            data={questionJsonLd({
              name: `${t} 問${q.q_number}`,
              text: stripMd(q.body),
              url,
              choices: q.choices.map((c) => ({ label: c.label, text: c.text })),
              correctLabel: !unscored && labels.length === 1 ? labels[0] : undefined,
              explanation: q.explanation?.overall,
              partOfName: `${t} 過去問`,
              partOfUrl: `${SITE_URL}/kango/exam/${examId}`,
            })}
          />
        )}

        {/* 見出し */}
        <header style={{ marginBottom: 16 }}>
          {/* SEO 用 H1: 視覚的には下の「問N」を大見出しに使うが、H1 には問題のトピックを含める（fe/ip/ap/sg と同形） */}
          <h1 className="sr-only">
            {t} 問{q.q_number}：{stripMd(q.body).slice(0, 80)}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Link
              href={examUrl}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: accent,
                background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                padding: "4px 10px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              {t}
            </Link>
            {tag && (
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-kn-text-3)" }}>{tag}</span>
            )}
            {cat && (
              <Link
                href={`/kango/category/${q.category}`}
                style={{ fontSize: 12, fontWeight: 700, color: "var(--color-kn-text-3)", textDecoration: "none" }}
              >
                {cat.name}
              </Link>
            )}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-kn-text-1)" }}>
            問{q.q_number}
          </div>
        </header>

        {/* 状況設定 */}
        {q.scenario && (
          <section className="kn-card" style={{ padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--color-kn-text-3)", marginBottom: 6 }}>
              状況設定{q.scenario.range ? ` 問${q.scenario.range}` : ""}
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.85, color: "var(--color-kn-text-2)" }}>
              {q.scenario.text}
            </p>
          </section>
        )}

        {/* 問題文 + 図 + 選択肢 */}
        <section className="kn-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.7, color: "var(--color-kn-text-1)" }}>
            {q.body}
          </p>

          {q.figures && q.figures.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              {q.figures.map((f, i) =>
                f.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={f.id ?? i}
                    src={f.url}
                    alt={f.alt ?? `${t} 問${q.q_number} 図${i + 1}`}
                    style={{
                      maxWidth: "100%",
                      borderRadius: 14,
                      border: "1px solid var(--color-kn-line)",
                      background: "#fff",
                      padding: 8,
                    }}
                  />
                ) : null,
              )}
            </div>
          )}

          {q.choices && q.choices.length > 0 ? (
            <ol style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {q.choices.map((c) => {
                const ok = !unscored && labels.includes(c.label)
                return (
                  <li
                    key={c.label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1.5px solid ${ok ? "var(--color-kn-success)" : "var(--color-kn-line)"}`,
                      background: ok ? "var(--color-kn-success-soft)" : "var(--color-kn-surface)",
                    }}
                  >
                    <span
                      style={{
                        flex: "none",
                        width: 30,
                        height: 30,
                        borderRadius: 9999,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 14,
                        fontWeight: 800,
                        background: ok ? "var(--color-kn-success)" : "var(--color-kn-num-bg)",
                        color: ok ? "#fff" : "var(--color-kn-num-text)",
                      }}
                    >
                      {c.label}
                    </span>
                    <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600, lineHeight: 1.6, color: "var(--color-kn-text-1)" }}>
                      {c.text}
                      {ok && (
                        <span style={{ marginLeft: 8, fontSize: 12.5, fontWeight: 800, color: "var(--color-kn-success)" }}>✓ 正解</span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ol>
          ) : (
            q.answer_type === "numeric" && (
              <p style={{ marginTop: 16, fontSize: 15, color: "var(--color-kn-text-2)" }}>
                解答形式: 数値入力{q.unit ? `（単位: ${q.unit}）` : ""}
              </p>
            )
          )}
        </section>

        {/* 正解・解説 */}
        <section className="kn-card" style={{ padding: 18, marginTop: 14 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "var(--color-kn-text-3)", margin: "0 0 6px" }}>正解</h2>
          <p style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 800, color: unscored ? "var(--color-kn-text-2)" : "var(--color-kn-success)" }}>
            {unscored ? "採点除外（正誤に数えない問題）" : correctDisplay(q.correct)}
            {!unscored && q.answer_type === "numeric" && q.unit ? ` ${q.unit}` : ""}
          </p>

          {q.explanation ? (
            <>
              <h2 style={{ fontSize: 13, fontWeight: 800, color: "var(--color-kn-text-3)", margin: "0 0 8px" }}>解説</h2>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.85, color: "var(--color-kn-text-2)" }}>
                {q.explanation.overall}
              </p>

              {q.explanation.per_choice && q.explanation.per_choice.length > 0 && (
                <>
                  <hr style={{ border: "none", borderTop: "1px solid var(--color-kn-line)", margin: "16px 0" }} />
                  <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--color-kn-text-3)", margin: "0 0 10px" }}>選択肢の解説</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {q.explanation.per_choice.map((p) => {
                      const ok = labels.includes(p.label)
                      return (
                        <div key={p.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span
                            style={{
                              flex: "none",
                              width: 26,
                              height: 26,
                              borderRadius: 9999,
                              display: "grid",
                              placeItems: "center",
                              fontSize: 13,
                              fontWeight: 800,
                              background: ok ? "var(--color-kn-success)" : "var(--color-kn-num-bg)",
                              color: ok ? "#fff" : "var(--color-kn-num-text)",
                            }}
                          >
                            {p.label}
                          </span>
                          <span style={{ flex: 1, fontSize: 13.5, lineHeight: 1.7, color: "var(--color-kn-text-2)" }}>{p.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {q.explanation.sources && q.explanation.sources.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--color-kn-text-3)", margin: "0 0 8px" }}>出典・参考</h3>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {q.explanation.sources.map((s, i) => (
                      <li key={i}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 13, fontWeight: 600, color: "var(--color-kn-primary)", textDecoration: "underline" }}
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--color-kn-text-3)" }}>この問題の解説は順次追加予定です。</p>
          )}

          {/* 用語（本文の難語の定義。検索流入の語彙としても有効） */}
          {q.glossary && q.glossary.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--color-kn-text-3)", margin: "0 0 8px" }}>用語</h3>
              <dl style={{ margin: 0 }}>
                {q.glossary.map((g) => (
                  <div key={g.term} style={{ marginBottom: 8 }}>
                    <dt style={{ fontSize: 13.5, fontWeight: 800, color: "var(--color-kn-text-1)" }}>{g.term}</dt>
                    <dd style={{ margin: "2px 0 0", fontSize: 13, lineHeight: 1.7, color: "var(--color-kn-text-2)" }}>{g.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        {/* 関連問題（同分野）= 内部リンク。SEO のトピッククラスタ＆クロール導線（fe/ip/ap/sg と同形） */}
        {related.length > 0 && (
          <section style={{ marginTop: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 800, color: "var(--color-kn-text-3)", margin: "0 0 10px" }}>
              関連問題（同分野）
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {related.map((r) => {
                const sharedTag = (r.tags ?? []).find((tg) => currentTags.has(tg))
                const preview = stripMd(r.body).slice(0, 50)
                return (
                  <Link
                    key={r._id}
                    href={`/kango/play/${examId}/q/${r.q_number}`}
                    className="kn-card"
                    style={{ padding: 12, textDecoration: "none", display: "block" }}
                  >
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-kn-text-3)", marginBottom: 4 }}>
                      問{r.q_number}
                      {sharedTag && (
                        <span style={{ marginLeft: 8, color: "var(--color-kn-primary-text)" }}>{sharedTag}</span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "var(--color-kn-text-2)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {preview}
                      {preview.length >= 50 ? "…" : ""}
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* アプリ形式（横スワイプ演習）への導線 */}
        <div style={{ marginTop: 16 }}>
          <Link href={`/kango/play/${examId}?start=${idx}`} className="kn-btn-primary" style={{ textDecoration: "none" }}>
            この問題から続けて演習する
          </Link>
        </div>

        {/* 前後ナビ（個別ページ同士を内部リンクで連結＝クロール導線） */}
        <nav style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
          {prev ? (
            <Link href={`/kango/play/${examId}/q/${prev.q_number}`} className="kn-btn-ghost" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
              ‹ 問{prev.q_number}
            </Link>
          ) : (
            <span style={{ flex: 1 }} />
          )}
          <Link href={examUrl} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-kn-text-2)", textDecoration: "none", minWidth: 80, textAlign: "center" }}>
            問題一覧
          </Link>
          {next ? (
            <Link href={`/kango/play/${examId}/q/${next.q_number}`} className="kn-btn-ghost" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
              問{next.q_number} ›
            </Link>
          ) : (
            <span style={{ flex: 1 }} />
          )}
        </nav>

        <footer style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--color-kn-line)" }}>
          <KangoNav />
        </footer>
      </div>
    </main>
  )
}
