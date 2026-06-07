import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { listScExams, listScQuestions } from "@/lib/api-client"
import { makeMetadata } from "@/lib/seo/metadata"
import { learningResourceJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { ScPageFrame } from "@/components/sc/ScPageFrame"
import { ScBreadcrumbs } from "@/components/sc/ScBreadcrumbs"
import { ScSectionHead } from "@/components/sc/ScChrome"
import { buildExamIntro } from "@/lib/seo/exam-intro"
import { tagToSlug } from "@/lib/tag-url"

export async function generateStaticParams() {
  const exams = await listScExams()
  return exams.map((e) => ({ examId: e.exam_id }))
}

interface PageProps {
  params: Promise<{ examId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId } = await params
  const exams = await listScExams()
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) return {}

  const examLabel = exam.title ?? `${exam.year} ${exam.section}`
  const title = `${examLabel} 過去問 ${exam.question_count} 問`
  const description = `情報処理安全確保支援士試験 ${examLabel} の過去問 ${exam.question_count} 問。順番・ランダム・模試 (40 分) の 3 モードで解け、全問に解説と選択肢ごとの正誤解説・ヒント付き。`
  const canonical = `/sc/exam/${exam.exam_id}`
  return makeMetadata({ title, description, path: canonical })
}

function stripPlain(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/[#*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default async function ScExamDetailPage({ params }: PageProps) {
  const { examId } = await params
  const [exams, questions] = await Promise.all([
    listScExams(),
    listScQuestions(examId).catch(() => []),
  ])
  const exam = exams.find((e) => e.exam_id === examId)
  if (!exam) notFound()

  const base = `/sc/play/${exam.exam_id}`
  const examLabel = exam.title ?? `${exam.year} ${exam.section}`
  const intro = buildExamIntro({ exam, subject: "sc" })

  const tagCounts = new Map<string, number>()
  for (const q of questions) {
    for (const t of q.tags ?? []) {
      if (!t) continue
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const sortedQuestions = [...questions].sort((a, b) => a.q_number - b.q_number)

  return (
    <ScPageFrame title="試験詳細">
      <ScBreadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "情報処理安全確保支援士試験", href: "/sc" },
        { name: examLabel, href: `/sc/exam/${exam.exam_id}` },
      ]} />
      <JsonLd
        data={learningResourceJsonLd({
          name: `${examLabel} 過去問`,
          description: `情報処理安全確保支援士試験 ${examLabel} の過去問 ${exam.question_count} 問・解説・ヒント付き`,
          url: `${SITE_URL}/sc/exam/${exam.exam_id}`,
          numberOfItems: exam.question_count,
          aboutName: "情報処理安全確保支援士試験",
        })}
      />

      <p className="sc-page-subtitle">{exam.exam_id}</p>
      <h1 className="sc-page-title">{examLabel}</h1>
      <p className="sc-page-lead">{intro}</p>

      <ScSectionHead title="演習モード" />
      <div className="sc-mode-list">
        <Link href={`${base}/q/1`} className="sc-mode-btn">
          <span className="sc-mode-btn-icon">📋</span>
          <span className="sc-mode-btn-text">
            <span className="sc-mode-btn-title">順番に解く</span>
            <span className="sc-mode-btn-sub">全 {exam.question_count} 問を 1 問ずつ</span>
          </span>
          <span className="sc-mode-btn-arrow">›</span>
        </Link>
        <Link href={`${base}?mode=random`} className="sc-mode-btn">
          <span className="sc-mode-btn-icon">🔀</span>
          <span className="sc-mode-btn-text">
            <span className="sc-mode-btn-title">ランダムに解く</span>
            <span className="sc-mode-btn-sub">{exam.question_count} 問をシャッフル</span>
          </span>
          <span className="sc-mode-btn-arrow">›</span>
        </Link>
        <Link href={`${base}?mode=exam`} className="sc-mode-btn" data-emphasis="true">
          <span className="sc-mode-btn-icon">⏱</span>
          <span className="sc-mode-btn-text">
            <span className="sc-mode-btn-title">模試 40 分</span>
            <span className="sc-mode-btn-sub">本番想定・採点あり</span>
          </span>
          <span className="sc-mode-btn-arrow">›</span>
        </Link>
      </div>

      {topTags.length > 0 && (
        <>
          <ScSectionHead title={`出題分野 (上位 ${topTags.length} 件)`} />
          <div className="sc-tag-grid">
            {topTags.map(([tag, count]) => (
              <Link key={tag} href={`/sc/tag/${tagToSlug(tag)}`} className="sc-tag-grid-item">
                <span className="sc-tag-grid-item-name">{tag}</span>
                <span className="sc-tag-grid-item-count">{count}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {sortedQuestions.length > 0 && (
        <>
          <ScSectionHead title={`収録問題一覧 (全 ${sortedQuestions.length} 問)`} />
          <div className="sc-q-list">
            {sortedQuestions.map((q) => {
              const preview = stripPlain(q.body).slice(0, 64)
              return (
                <Link key={q._id} href={`${base}/q/${q.q_number}`} className="sc-q-row">
                  <span className="sc-q-row-num">問 {q.q_number}</span>
                  <span className="sc-q-row-text">{preview}{preview.length === 64 ? "…" : ""}</span>
                </Link>
              )
            })}
          </div>
        </>
      )}

      <ScSectionHead title="関連ページ" />
      <div className="sc-related-list">
        <Link href="/sc/guide" className="sc-related-row">
          <span className="sc-related-icon">📘</span>
          <span className="sc-related-text">
            <span className="sc-related-title">学習ガイド</span>
            <span className="sc-related-sub">試験概要・出題範囲・勉強法</span>
          </span>
          <span className="sc-related-arrow">›</span>
        </Link>
        <Link href="/sc/faq" className="sc-related-row">
          <span className="sc-related-icon">❓</span>
          <span className="sc-related-text">
            <span className="sc-related-title">FAQ</span>
            <span className="sc-related-sub">よくある質問</span>
          </span>
          <span className="sc-related-arrow">›</span>
        </Link>
      </div>

      <p className="sc-footnote">
        ← <Link href="/sc">情報処理安全確保支援士試験 のトップ</Link>へ戻る ({examLabel})
      </p>
    </ScPageFrame>
  )
}
