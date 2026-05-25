import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listExams, listQuestions, getExamStats } from "@/lib/api-client";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { PlayController } from "@/components/play/PlayController";
import type { QuestionStat } from "@/lib/types";
import { makeMetadata } from "@/lib/seo/metadata";
import { questionJsonLd, SITE_URL } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { QuestionSeoExtras } from "@/components/seo/QuestionSeoExtras";
import { RelatedQuestions } from "@/components/seo/RelatedQuestions";

interface PageProps {
  params: Promise<{ examId: string; qNumber: string }>;
}

function stripMd(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { examId, qNumber } = await params;
  const n = Number(qNumber);
  if (!Number.isInteger(n) || n < 1) return {};

  try {
    const [exams, questions] = await Promise.all([
      listExams(),
      listQuestions(examId),
    ]);
    const exam = exams.find((e) => e.exam_id === examId);
    const q = questions.find((q) => q.q_number === n);
    if (!exam || !q) return {};

    const examLabel = exam.title ?? `${exam.year} ${exam.section}`;
    const bodyPreview = stripMd(q.body).slice(0, 90);
    const title = `${examLabel} 午前 問${n}：${bodyPreview}`;
    const description = `基本情報技術者試験 ${examLabel} 午前 問${n} の問題本文・選択肢・正解・解説。${bodyPreview}…`;
    const canonical = `/fe/play/${exam.exam_id}/q/${n}`;

    return makeMetadata({ title, description, path: canonical, type: "article" });
  } catch {
    return {};
  }
}

export default async function FePlayQuestionPage({ params }: PageProps) {
  const { examId, qNumber } = await params;
  const n = Number(qNumber);
  if (!Number.isInteger(n) || n < 1) notFound();

  const [exams, questions, statsMap] = await Promise.all([
    listExams(),
    listQuestions(examId),
    getExamStats(examId),
  ]);
  const exam = exams.find((e) => e.exam_id === examId);
  if (!exam) notFound();
  const stats: Record<string, QuestionStat> = Object.fromEntries(statsMap);
  const q = questions.find((q) => q.q_number === n);
  if (!q) notFound();

  const url = `${SITE_URL}/fe/play/${exam.exam_id}/q/${n}`;
  const examLabel = exam.title ?? exam.exam_id;
  const examUrl = `/fe/exam/${exam.exam_id}`;

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "基本情報技術者試験", href: "/fe" },
        { name: examLabel, href: examUrl },
        { name: `問${n}`, href: `/fe/play/${exam.exam_id}/q/${n}` },
      ]} />
      <JsonLd
        data={questionJsonLd({
          name: `${examLabel} 午前 問${n}`,
          text: stripMd(q.body),
          url,
          choices: q.choices.map((c) => ({ label: c.label, text: c.text })),
          correctLabel: q.correct_label,
          explanation: q.explanation?.overall,
          partOfName: `${examLabel} 過去問`,
          partOfUrl: `${SITE_URL}/fe/exam/${exam.exam_id}`,
        })}
      />
      <h1 className="sr-only">
        基本情報技術者試験 {examLabel} 午前 問{n}: {stripMd(q.body).slice(0, 80)}
      </h1>
      <PlayController
        questions={questions}
        exam={exam}
        mode="sequential"
        initialQNumber={n}
        stats={stats}
      />
      <QuestionSeoExtras
        examLabel={examLabel}
        qNumber={n}
        body={q.body}
        choices={q.choices}
        correctLabel={q.correct_label}
        explanation={q.explanation}
        examUrl={examUrl}
      />
      <RelatedQuestions
        current={{ q_number: n, tags: q.tags }}
        examQuestions={questions}
        basePath={`/fe/play/${exam.exam_id}/q`}
        examLabel={examLabel}
      />
    </MobileFrame>
  );
}
