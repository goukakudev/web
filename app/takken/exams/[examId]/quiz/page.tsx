import type { Metadata } from "next"
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
  const result = await TakkenAPI.listExamQuestions(examId)
  if (!result || result.questions.length === 0) notFound()
  const exam = await TakkenAPI.getExam(examId)
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
      <QuizClient
        examId={examId}
        questions={result.questions}
        mode={mode === "exam" ? "exam" : "instant"}
      />
    </>
  )
}
