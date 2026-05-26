import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { TakkenAPI } from "@/lib/takken/api"
import { makeMetadata } from "@/lib/seo/metadata"
import { questionJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
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
  const path =
    qn > 1
      ? `/takken/exams/${exam.exam_id}/quiz?q=${qn}`
      : `/takken/exams/${exam.exam_id}/quiz`
  return makeMetadata({
    title: `${exam.label} 宅建 問${qn}`,
    description: `宅地建物取引士試験 ${exam.label} 問${qn} の本文・選択肢・正解・解説。`,
    path,
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
      />
      <section className="sr-only" aria-label="この問題の本文・選択肢・正解・解説 (検索エンジン用)">
        <section>
          <h3>問題本文</h3>
          <p>{current.question_text}</p>
        </section>
        <section>
          <h3>選択肢</h3>
          <ul>
            {choices.map((c) => (
              <li key={c.label}>
                <span>{c.label}.</span>
                {c.text}
              </li>
            ))}
          </ul>
        </section>
        {current.correct_answer != null && (
          <section>
            <h3>正解</h3>
            <p>
              <span>{current.correct_answer}.</span>{" "}
              {String(current.choices[String(current.correct_answer)] ?? "")}
            </p>
          </section>
        )}
        {current.explanation?.commentary && (
          <section>
            <h3>解説</h3>
            <p>{current.explanation.commentary}</p>
          </section>
        )}
        {exam && (
          <p>
            {exam.label} の<Link href={`/takken/exams/${exam.exam_id}`}>過去問一覧</Link>へ戻る・問{current.question_number}
          </p>
        )}
      </section>
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
    </>
  )
}
