import { notFound } from "next/navigation";
import { listExams, listQuestions } from "@/lib/api-client";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { PlayController } from "@/components/play/PlayController";

interface PageProps {
  params: Promise<{ examId: string; qNumber: string }>;
}

export default async function PlayQuestionPage({ params }: PageProps) {
  const { examId, qNumber } = await params;
  const n = Number(qNumber);
  if (!Number.isInteger(n) || n < 1) notFound();

  const exams = await listExams();
  const exam = exams.find((e) => e.exam_id === examId);
  if (!exam) notFound();

  const questions = await listQuestions(examId);
  if (!questions.some((q) => q.q_number === n)) notFound();

  return (
    <MobileFrame>
      <PlayController
        questions={questions}
        exam={exam}
        mode="sequential"
        initialQNumber={n}
      />
    </MobileFrame>
  );
}
