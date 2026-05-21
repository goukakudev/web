"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { StatsCard } from "@/components/diagnosis/StatsCard";
import { getAllAnswers } from "@/lib/local-store";
import type { ExamSummary } from "@/lib/types";
import type { AnswerRecord } from "@/lib/local-store";

export default function DiagnosisPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydration runs after first paint
    setAnswers(getAllAnswers());
    fetch("/api/exams")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)),
      )
      .then((data: { exams: ExamSummary[] }) => setExams(data.exams))
      .catch((e: Error) => setError(e.message));
  }, []);

  const perExam = exams.map((ex) => {
    const examAnswers = Object.values(answers).filter(
      (a) => a.exam_id === ex.exam_id,
    );
    const correct = examAnswers.filter(
      (a) =>
        a.correct_label !== undefined && a.selected_label === a.correct_label,
    ).length;
    return { exam: ex, answered: examAnswers.length, correct };
  });

  return (
    <MobileFrame>
      <Link href="/fe" className="inline-block text-[14px] mb-4">
        ← ホーム
      </Link>
      <h1 className="text-[20px] font-extrabold mb-4">学習診断</h1>
      {error && (
        <p className="text-[13px] text-goukaku-ink/55 mt-4">
          読み込みに失敗しました: {error}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {perExam.map(({ exam, answered, correct }) => (
          <StatsCard
            key={exam.exam_id}
            title={exam.title ?? exam.exam_id}
            answered={answered}
            correct={correct}
            total={exam.question_count}
          />
        ))}
      </div>
    </MobileFrame>
  );
}
