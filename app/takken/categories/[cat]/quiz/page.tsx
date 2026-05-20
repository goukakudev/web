import { notFound } from "next/navigation";
import { TakkenAPI } from "@/lib/takken/api";
import QuizClient from "../../../exams/[examId]/quiz/QuizClient";

type Props = {
  params: Promise<{ cat: string }>;
  searchParams: Promise<{ count?: string }>;
};

export default async function CategoryQuizPage({ params, searchParams }: Props) {
  const { cat } = await params;
  const { count } = await searchParams;
  const decoded = decodeURIComponent(cat);
  const data = await TakkenAPI.listCategoryQuestions(decoded);
  if (data.count === 0) notFound();

  let questions = data.questions;
  if (count) {
    const n = parseInt(count, 10);
    if (!Number.isNaN(n) && n > 0 && n < questions.length) {
      // ランダムサンプリング
      questions = [...questions].sort(() => Math.random() - 0.5).slice(0, n);
    }
  }

  return (
    <QuizClient
      examId={`cat-${decoded}`}
      questions={questions}
      mode="instant"
    />
  );
}
