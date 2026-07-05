import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { TakkenAPI } from "@/lib/takken/api"
import { generateTakkenStats } from "@/lib/takken/dummy-stats"
import { makeMetadata } from "@/lib/seo/metadata"
import { questionJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { QuizBottomActions } from "@/components/play/QuizBottomActions"
import QuizClient from "./QuizClient"

type Props = {
  params: Promise<{ examId: string }>
  searchParams: Promise<{ mode?: "exam" | "instant"; q?: string }>
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { examId } = await params
  const { q } = await searchParams
  const exam = await TakkenAPI.getExam(examId)
  if (!exam) return {}
  const parsed = Number(q ?? "1")
  const qn = Number.isInteger(parsed) && parsed > 0 ? parsed : 1
  // ?q=N は同一クイズページの表示状態。以前は ?q 付き URL を自己 canonical に
  // していたが、試験回ごとに最大 50 のクエリ付き近重複 URL が生まれ、GSC で
  // 「クロール済み - インデックス未登録」に大量滞留した。canonical をクエリ
  // なしの /quiz に統一し、1 試験回 = 1 インデックス対象へ集約する。
  return makeMetadata({
    title: `${exam.label} 問${qn}`,
    description: `宅地建物取引士試験 ${exam.label} 問${qn} の本文・選択肢・正解・解説。`,
    path: `/takken/exams/${exam.exam_id}/quiz`,
    type: "article",
  })
}

export default async function QuizPage({ params, searchParams }: Props) {
  const { examId } = await params
  const { mode, q } = await searchParams
  const [result, exam] = await Promise.all([
    TakkenAPI.listExamQuestions(examId),
    TakkenAPI.getExam(examId),
  ])
  if (!result || result.questions.length === 0) notFound()
  const parsed = Number(q ?? "1")
  const qn = Number.isInteger(parsed) && parsed > 0 ? parsed : 1
  const current =
    result.questions.find((qq) => qq.question_number === qn) ??
    result.questions[0]
  const choices = Object.entries(current.choices).map(([label, text]) => ({
    label,
    text: String(text),
  }))

  return (
    <>
      {exam && (
        <Breadcrumbs
          items={[
            { name: "合格.dev", href: "/" },
            { name: "宅建", href: "/takken" },
            { name: exam.label, href: `/takken/exams/${exam.exam_id}` },
            {
              name: `問${current.question_number}`,
              href: `/takken/exams/${exam.exam_id}/quiz?q=${current.question_number}`,
            },
          ]}
        />
      )}
      <JsonLd
        data={questionJsonLd({
          name: `${exam?.label ?? examId} 宅建 問${current.question_number}`,
          text: current.question_text,
          url: `https://goukaku.dev/takken/exams/${examId}/quiz?q=${current.question_number}`,
          choices,
          correctLabel:
            current.correct_answer != null
              ? String(current.correct_answer)
              : undefined,
          explanation: current.explanation?.commentary ?? undefined,
          partOfName: `${exam?.label ?? examId} 宅建過去問`,
          partOfUrl: `https://goukaku.dev/takken/exams/${examId}`,
        })}
      />
      <h1 className="sr-only">
        宅地建物取引士試験 {exam?.label ?? examId} 問{current.question_number}: {current.question_text.slice(0, 80)}
      </h1>
      <QuizClient
        examId={examId}
        questions={result.questions}
        mode={mode === "exam" ? "exam" : "instant"}
        initialQuestionNumber={current.question_number}
        stats={exam ? generateTakkenStats(exam, result.questions) : {}}
      />
      <section
        aria-label="出題情報"
        className="mx-auto mt-6 max-w-3xl rounded-xl border border-tk-line bg-tk-card/30 px-4 py-3 text-[12px] text-tk-ink-2"
      >
        <h2 className="font-mincho text-[13px] font-semibold text-tk-ink mb-2">
          📋 出題情報
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
          {exam && (
            <>
              <dt className="text-tk-ink-3">試験回</dt>
              <dd>
                <Link href={`/takken/exams/${exam.exam_id}`} className="underline">
                  {exam.label}
                </Link>
                {" ・ "}
                <Link href={`/takken/year/${exam.year}`} className="underline">
                  {exam.year} 年
                </Link>
              </dd>
            </>
          )}
          {current.category && (
            <>
              <dt className="text-tk-ink-3">分野</dt>
              <dd>
                <Link
                  href={`/takken/categories/${encodeURIComponent(current.category)}`}
                  className="underline"
                >
                  {current.category}
                </Link>
                {current.sub_category && (
                  <span className="text-tk-ink-3"> ／ {current.sub_category}</span>
                )}
              </dd>
            </>
          )}
          {current.tags && current.tags.length > 0 && (
            <>
              <dt className="text-tk-ink-3">論点</dt>
              <dd className="flex flex-wrap gap-1.5">
                {current.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-block rounded-full border border-tk-line px-2 py-0.5 text-[11px]"
                  >
                    {t}
                  </span>
                ))}
              </dd>
            </>
          )}
        </dl>
        <p className="mt-3 text-[11px] text-tk-ink-3 leading-relaxed">
          合格.dev の解説は、本サイト独自編集による要約です。各選択肢がなぜ正解か / なぜ違うかを言語化することで、四肢択一の引っかけパターンへの対応力を養うことを目的としています。
        </p>
      </section>
      <details className="mx-auto mt-6 max-w-3xl rounded-xl border border-tk-line bg-tk-card/40 px-4 py-3 text-[13px] text-tk-ink-2">
        <summary className="cursor-pointer select-none font-mincho text-[13px] font-semibold text-tk-ink">
          📖 解答と解説を表示 (クイズの答えが見えます)
        </summary>
        <div className="mt-3 space-y-3 leading-relaxed">
          {current.correct_answer != null && (
            <section>
              <h3 className="text-[12px] font-bold text-tk-ink-3">正解</h3>
              <p className="mt-1">
                <span className="font-bold">{current.correct_answer}.</span>{" "}
                {String(current.choices[String(current.correct_answer)] ?? "")}
              </p>
            </section>
          )}
          {current.explanation?.commentary && (
            <section>
              <h3 className="text-[12px] font-bold text-tk-ink-3">解説</h3>
              <p className="mt-1 whitespace-pre-line">{current.explanation.commentary}</p>
            </section>
          )}
          {exam && (
            <p className="text-[12px] text-tk-ink-3">
              <Link href={`/takken/exams/${exam.exam_id}`} className="underline">
                {exam.label} 過去問一覧
              </Link>
              に戻る ・ 問{current.question_number}
            </p>
          )}
        </div>
      </details>
      {(() => {
        const cur = current
        const tags = new Set(cur.tags ?? [])
        const sameTag = result.questions
          .filter((qq) => qq.question_number !== cur.question_number)
          .map((qq) => ({
            qq,
            overlap: (qq.tags ?? []).filter((t) => tags.has(t)).length,
          }))
          .filter((x) => x.overlap > 0)
          .sort((a, b) => b.overlap - a.overlap || a.qq.question_number - b.qq.question_number)
          .slice(0, 5)
          .map((x) => x.qq)
        const prev = result.questions.find((qq) => qq.question_number === cur.question_number - 1)
        const next = result.questions.find((qq) => qq.question_number === cur.question_number + 1)
        if (sameTag.length === 0 && !prev && !next) return null
        return (
          <aside className="mx-auto max-w-3xl mt-6 border-t border-line pt-4">
            <h2 className="text-[13px] font-mincho font-semibold mb-2 text-ink">関連問題</h2>
            {(prev || next) && (
              <nav aria-label="前後の問題" className="flex gap-2 mb-3 text-[12px]">
                {prev && (
                  <Link href={`/takken/exams/${examId}/quiz?q=${prev.question_number}`}
                    className="flex-1 rounded-lg border border-line px-3 py-2 text-ink-2 hover:bg-canvas">
                    ← 問{prev.question_number}
                  </Link>
                )}
                {next && (
                  <Link href={`/takken/exams/${examId}/quiz?q=${next.question_number}`}
                    className="flex-1 rounded-lg border border-line px-3 py-2 text-right text-ink-2 hover:bg-canvas">
                    問{next.question_number} →
                  </Link>
                )}
              </nav>
            )}
            {sameTag.length > 0 && (
              <ul className="space-y-1.5">
                {sameTag.map((qq) => (
                  <li key={qq._id}>
                    <Link href={`/takken/exams/${examId}/quiz?q=${qq.question_number}`}
                      className="block rounded-lg border border-line px-3 py-2 hover:bg-canvas">
                      <span className="text-[11px] font-bold text-ink-3">問{qq.question_number}</span>
                      <span className="block text-[12px] text-ink-2 mt-0.5 line-clamp-2">
                        {qq.question_text.slice(0, 60)}
                        {qq.question_text.length > 60 ? "…" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )
      })()}
      <aside
        aria-label="宅建士試験の学習リソース"
        className="mx-auto max-w-3xl mt-6 rounded-2xl border border-line bg-bg/60 p-5"
      >
        <h2 className="text-[14px] font-mincho font-semibold text-ink mb-2">
          宅建 の学習リソース
        </h2>
        <p className="text-[12px] leading-[1.85] text-ink-2 mb-3">
          この問題で扱った分野をさらに深掘りしたい方へ。宅建士試験の試験概要・出題範囲・合格基準・標準学習スケジュール (300〜500 時間)・分野別の攻略法までを 1 ページに集約した<strong>独自編集の学習ガイド</strong>と、よくある質問をまとめた FAQ を用意しています。
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/takken/guide"
            className="inline-flex items-center rounded-full border border-line bg-bg/60 px-3 py-1.5 text-[12px] font-semibold text-ink/80 hover:text-ink"
          >
            📘 宅建 学習ガイドを読む →
          </Link>
          <Link
            href="/takken/faq"
            className="inline-flex items-center rounded-full border border-line bg-bg/60 px-3 py-1.5 text-[12px] font-semibold text-ink/80 hover:text-ink"
          >
            ❓ 宅建 FAQ
          </Link>
          <Link
            href="/takken"
            className="inline-flex items-center rounded-full border border-line bg-bg/60 px-3 py-1.5 text-[12px] font-semibold text-ink/80 hover:text-ink"
          >
            🏠 宅建トップ
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-ink-3 leading-[1.7]">
          この問題ページの解説・選択肢別解説・分野タグ・関連問題リンクは、すべて合格.dev 編集部による独自編集です (問題文・選択肢は不動産適正取引推進機構公表過去問の引用)。詳しくは{" "}
          <Link href="/about" className="underline">編集方針</Link>{" / "}
          <Link href="/sources" className="underline">出典一覧</Link>
          {" "}を参照してください。
        </p>
      </aside>
      <QuizBottomActions examKey="tk" variant="takken" />
    </>
  )
}
