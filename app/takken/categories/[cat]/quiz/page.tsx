import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { TakkenAPI } from "@/lib/takken/api"
import { makeMetadata } from "@/lib/seo/metadata"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import QuizClient from "../../../exams/[examId]/quiz/QuizClient"

type Props = {
  params: Promise<{ cat: string }>
  searchParams: Promise<{ count?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params
  const decoded = decodeURIComponent(cat)
  return makeMetadata({
    title: `${decoded} 宅建 分野別演習`,
    description: `宅地建物取引士試験 ${decoded} 分野の過去問演習。ランダム出題で実力チェック。`,
    path: `/takken/categories/${cat}/quiz`,
  })
}

export default async function CategoryQuizPage({ params, searchParams }: Props) {
  const { cat } = await params
  const { count } = await searchParams
  const decoded = decodeURIComponent(cat)
  const data = await TakkenAPI.listCategoryQuestions(decoded)
  if (data.count === 0) notFound()

  let questions = data.questions
  if (count) {
    const n = parseInt(count, 10)
    if (!Number.isNaN(n) && n > 0 && n < questions.length) {
      // Fisher-Yates shuffle; the previous `sort(() => Math.random() - 0.5)`
      // is biased on most engines because the comparator isn't transitive.
      const shuffled = [...questions]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      questions = shuffled.slice(0, n)
    }
  }

  return (
    <>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "宅建", href: "/takken" },
        { name: "分野別", href: "/takken/categories" },
        { name: decoded, href: `/takken/categories/${cat}` },
        { name: "演習", href: `/takken/categories/${cat}/quiz` },
      ]} />
      <QuizClient
        examId={`cat-${decoded}`}
        questions={questions}
        mode="instant"
      />
    </>
  )
}
