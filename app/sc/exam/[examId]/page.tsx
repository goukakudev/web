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

/** examId の "sc-2025r07h-am2" → "2025R07H AM2" 風の編集ラベル */
function editorialMeta(exam: { exam_id: string; year: string; section?: string }): string[] {
  const parts: string[] = [exam.exam_id.toUpperCase()]
  if (exam.section) parts.push(exam.section)
  return parts
}

/** 年文字列 "2025r07h" → "令和 7 年度 春期" */
function readableYear(year: string): string {
  if (!year || year.length < 7) return year
  const era = year[4] === "r" ? "令和" : year[4] === "h" ? "平成" : ""
  const n = parseInt(year.slice(5, 7), 10)
  const season = year.slice(7).toLowerCase()
  const seasonLabel = season === "h" ? "春期" : season === "a" ? "秋期" : ""
  if (!era || Number.isNaN(n)) return year
  return [`${era} ${n} 年度`, seasonLabel].filter(Boolean).join(" ")
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
  const yearLabel = readableYear(exam.year)

  // 出題分野ランキング
  const tagCounts = new Map<string, number>()
  for (const q of questions) {
    for (const t of q.tags ?? []) {
      if (!t) continue
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  const maxTagCount = topTags[0]?.[1] ?? 1
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

      {/* ヒーロー: 編集タイトル + メタ */}
      <section className="sc-exam-hero">
        <div className="sc-exam-hero-meta">
          {editorialMeta(exam).map((p, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              {i > 0 && <span className="sc-exam-hero-meta-dot" aria-hidden />}
              {p}
            </span>
          ))}
        </div>
        <h1 className="sc-exam-hero-title">{examLabel}</h1>
        <p className="sc-exam-hero-lead">
          {yearLabel} に出題された情報処理安全確保支援士試験 (SC) 午前 II の公開過去問です。
          全 {exam.question_count} 問に独自編集の選択肢別解説とヒントが付き、3 モード (順番 / ランダム / 模試 40 分) で演習できます。
        </p>
      </section>

      {/* スペック (2×2 統計) */}
      <ScSectionHead title="OVERVIEW" />
      <div className="sc-exam-stats">
        <Stat num={exam.question_count} unit="問" label="出題数" />
        <Stat num={40} unit="分" label="制限時間" />
        <Stat num={60} unit="点" label="合格点 / 100" />
        <Stat num={4} unit="択" label="選択肢数" />
      </div>

      {/* モード選択 — 編集レイアウト */}
      <ScSectionHead title="PLAY MODE" />
      <div className="sc-exam-modes">
        <Link href={`${base}/q/1`} className="sc-exam-mode">
          <span className="sc-exam-mode-num">01</span>
          <span className="sc-exam-mode-text">
            <span className="sc-exam-mode-title">順番に解く</span>
            <span className="sc-exam-mode-sub">全 {exam.question_count} 問を 1 問ずつ · タイマー無し</span>
          </span>
          <span className="sc-exam-mode-arrow" aria-hidden>→</span>
        </Link>
        <Link href={`${base}?mode=random`} className="sc-exam-mode">
          <span className="sc-exam-mode-num">02</span>
          <span className="sc-exam-mode-text">
            <span className="sc-exam-mode-title">ランダムに解く</span>
            <span className="sc-exam-mode-sub">{exam.question_count} 問をシャッフル · 出題傾向の俯瞰に</span>
          </span>
          <span className="sc-exam-mode-arrow" aria-hidden>→</span>
        </Link>
        <Link href={`${base}?mode=exam`} className="sc-exam-mode" data-emphasis="true">
          <span className="sc-exam-mode-num">03</span>
          <span className="sc-exam-mode-text">
            <span className="sc-exam-mode-title">模試 40 分</span>
            <span className="sc-exam-mode-sub">本番想定 · タイマー & 採点あり · 推奨</span>
          </span>
          <span className="sc-exam-mode-arrow" aria-hidden>→</span>
        </Link>
      </div>

      {/* 出題分野 (タグランキング) */}
      {topTags.length > 0 && (
        <>
          <ScSectionHead
            title={`TOPICS · 上位 ${topTags.length} 件`}
            trailingHref={`/sc/category/security-tech`}
            trailingLabel="分野一覧"
          />
          <div className="sc-exam-topics">
            {topTags.map(([tag, count], i) => (
              <Link key={tag} href={`/sc/tag/${tagToSlug(tag)}`} className="sc-exam-topic">
                <span className="sc-exam-topic-rank">{String(i + 1).padStart(2, "0")}</span>
                <span className="sc-exam-topic-name">{tag.replace(/^#/, "")}</span>
                <span className="sc-exam-topic-bar" aria-hidden>
                  <i style={{ width: `${(count / maxTagCount) * 100}%` }} />
                </span>
                <span className="sc-exam-topic-count">{count}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* 全問リスト */}
      {sortedQuestions.length > 0 && (
        <>
          <ScSectionHead title={`QUESTIONS · 全 ${sortedQuestions.length} 問`} />
          <div className="sc-exam-qs">
            {sortedQuestions.map((q) => {
              const preview = stripPlain(q.body).slice(0, 64)
              return (
                <Link key={q._id} href={`${base}/q/${q.q_number}`} className="sc-exam-q">
                  <span className="sc-exam-q-num">問 {String(q.q_number).padStart(2, "0")}</span>
                  <span className="sc-exam-q-text">{preview}{preview.length === 64 ? "…" : ""}</span>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* 関連ページ */}
      <ScSectionHead title="関連ページ" />
      <div className="sc-exam-related">
        <Link href="/sc/guide" className="sc-exam-related-row">
          <span className="sc-exam-related-icon" aria-hidden>📘</span>
          <span className="sc-exam-related-text">
            <span className="sc-exam-related-title">学習ガイド</span>
            <span className="sc-exam-related-sub">試験概要・出題範囲・標準学習スケジュール</span>
          </span>
          <span className="sc-exam-related-arrow" aria-hidden>›</span>
        </Link>
        <Link href="/sc/faq" className="sc-exam-related-row">
          <span className="sc-exam-related-icon" aria-hidden>❓</span>
          <span className="sc-exam-related-text">
            <span className="sc-exam-related-title">FAQ</span>
            <span className="sc-exam-related-sub">合格基準・午前 I 免除・登録制度などの Q&A</span>
          </span>
          <span className="sc-exam-related-arrow" aria-hidden>›</span>
        </Link>
        <Link href="/sc" className="sc-exam-related-row">
          <span className="sc-exam-related-icon" aria-hidden>🏠</span>
          <span className="sc-exam-related-text">
            <span className="sc-exam-related-title">情報処理安全確保支援士試験 トップ</span>
            <span className="sc-exam-related-sub">他の年度・分野・ブックマーク・履歴</span>
          </span>
          <span className="sc-exam-related-arrow" aria-hidden>›</span>
        </Link>
      </div>
    </ScPageFrame>
  )
}

function Stat({ num, unit, label }: { num: number; unit: string; label: string }) {
  return (
    <div className="sc-exam-stat">
      <div className="sc-exam-stat-value">
        <span className="sc-exam-stat-num">{num}</span>
        <span className="sc-exam-stat-unit">{unit}</span>
      </div>
      <div className="sc-exam-stat-label">{label}</div>
    </div>
  )
}
