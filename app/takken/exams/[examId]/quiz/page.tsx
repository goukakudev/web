import { notFound } from "next/navigation";
import { TakkenAPI } from "@/lib/takken/api";
import QuizClient from "./QuizClient";

type Props = {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ mode?: "exam" | "instant" }>;
};

export default async function QuizPage({ params, searchParams }: Props) {
  const { examId } = await params;
  const { mode } = await searchParams;
  const result = await TakkenAPI.listExamQuestions(examId);
  if (!result || result.questions.length === 0) notFound();

  return (
    <QuizClient
      examId={examId}
      questions={result.questions}
      mode={mode === "exam" ? "exam" : "instant"}
    />
  );
}
