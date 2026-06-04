import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { listKnQuestions, getKnExam } from "@/lib/kango/api"
import { displayTitle, shortLabel, examType, typeColor } from "@/lib/kango/exam"
import { makeMetadata } from "@/lib/seo/metadata"
import { JsonLd } from "@/components/seo/JsonLd"
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  learningResourceJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"
import { KangoNav, KangoBreadcrumb } from "@/components/kango/KangoNav"

export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ examId: string }>
}): Promise<Metadata> {
  const { examId } = await params
  const exam = await getKnExam(examId).catch(() => undefined)
  if (!exam) return {}
  const t = displayTitle(exam)
  return makeMetadata({
    title: `${t} 過去問`,
    description: `${t}の過去問 ${exam.question_count} 問を、選択肢別解説つきで無料演習。順番・ランダムで解けます。`,
    path: `/kango/exam/${examId}`,
  })
}

export default async function KangoExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const [questions, exam] = await Promise.all([
    listKnQuestions(examId).catch(() => []),
    getKnExam(examId).catch(() => undefined),
  ])
  if (!exam || !questions.length) notFound()

  const t = displayTitle(exam)
  const accent = typeColor(examId)
  const examUrl = `${SITE_URL}/kango/exam/${examId}`

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 48px" }}>
        <KangoBreadcrumb
          items={[
            { name: "合格.dev", href: "/" },
            { name: "看護", href: "/kango" },
            { name: shortLabel(exam), href: `/kango/exam/${examId}` },
          ]}
        />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "合格.dev", url: `${SITE_URL}/` },
            { name: "看護師国家試験 過去問", url: `${SITE_URL}/kango` },
            { name: shortLabel(exam), url: examUrl },
          ])}
        />
        <JsonLd
          data={learningResourceJsonLd({
            name: `${t} 過去問`,
            description: `${t}の過去問 ${exam.question_count} 問。選択肢別解説つき。`,
            url: examUrl,
            numberOfItems: exam.question_count,
            aboutName: `${examType(examId)}国家試験`,
          })}
        />
        <JsonLd
          data={collectionPageJsonLd({
            name: `${t} 問題一覧`,
            description: `${t}の全 ${questions.length} 問。`,
            url: examUrl,
            items: questions.map((q) => ({
              name: `問題 ${q.q_number}`,
              url: `${SITE_URL}/kango/play/${examId}/q/${q.q_number}`,
            })),
          })}
        />

        {/* ヘッダ */}
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              flex: "none",
              display: "grid",
              placeItems: "center",
              background: `color-mix(in srgb, ${accent} 14%, transparent)`,
              color: accent,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {examType(examId)}
          </span>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 800, color: "var(--color-kn-text-1)", margin: 0 }}>{t}</h1>
            <p style={{ fontSize: 12.5, color: "var(--color-kn-text-3)", margin: "4px 0 0" }}>
              過去問 全{exam.question_count}問 ・ 選択肢別解説つき
            </p>
          </div>
        </header>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <Link href={`/kango/play/${examId}`} className="kn-btn-primary" style={{ textDecoration: "none" }}>
            順番に解く
          </Link>
          <Link href={`/kango/play/${examId}?mode=random`} className="kn-btn-ghost" style={{ textDecoration: "none" }}>
            ランダム20問
          </Link>
        </div>

        {/* 問題番号グリッド */}
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-kn-text-1)", marginBottom: 10 }}>問題一覧</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(46px, 1fr))", gap: 8 }}>
          {questions.map((q) => (
            <Link
              key={q._id}
              href={`/kango/play/${examId}/q/${q.q_number}`}
              className="kn-card kn-card-sm"
              style={{
                minHeight: 46,
                display: "grid",
                placeItems: "center",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-kn-text-1)",
                textDecoration: "none",
              }}
            >
              {q.q_number}
            </Link>
          ))}
        </div>

        {/* about */}
        <section style={{ marginTop: 28, fontSize: 13, lineHeight: 1.85, color: "var(--color-kn-text-2)" }}>
          <p style={{ margin: 0 }}>
            {t}の過去問 {exam.question_count} 問を、選択肢ごとの解説つきで演習できます。問題番号をタップするとその問題から開始できます。「順番に解く」で通し演習、「ランダム20問」で記憶の定着確認に。学習記録は端末内に保存されます。出典は厚生労働省が公表する{examType(examId)}国家試験の過去問題に基づきます。
          </p>
        </section>

        <footer style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--color-kn-line)" }}>
          <KangoNav />
        </footer>
      </div>
    </main>
  )
}
