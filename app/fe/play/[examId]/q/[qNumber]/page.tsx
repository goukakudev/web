import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listExams, listQuestions, getExamStats } from "@/lib/api-client";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { PlayController } from "@/components/play/PlayController";
import type { QuestionStat } from "@/lib/types";

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

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "article",
        title,
        description,
        url: canonical,
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {};
  }
}

export default async function FePlayQuestionPage({ params }: PageProps) {
  const { examId, qNumber } = await params;
  const n = Number(qNumber);
  if (!Number.isInteger(n) || n < 1) notFound();

  const exams = await listExams();
  const exam = exams.find((e) => e.exam_id === examId);
  if (!exam) notFound();

  const [questions, statsMap] = await Promise.all([
    listQuestions(examId),
    getExamStats(examId),
  ]);
  const stats: Record<string, QuestionStat> = Object.fromEntries(statsMap);
  const q = questions.find((q) => q.q_number === n);
  if (!q) notFound();

  const url = `https://goukaku.dev/fe/play/${exam.exam_id}/q/${n}`;
  const acceptedText = q.choices.find((c) => c.label === q.correct_label)?.text;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Question",
    inLanguage: "ja",
    name: `${exam.title ?? exam.exam_id} 午前 問${n}`,
    text: stripMd(q.body),
    url,
    answerCount: q.choices.length,
    suggestedAnswer: q.choices.map((c) => ({
      "@type": "Answer",
      text: `${c.label}: ${c.text}`,
    })),
    ...(acceptedText && q.correct_label
      ? {
          acceptedAnswer: {
            "@type": "Answer",
            text: `${q.correct_label}: ${acceptedText}`,
            ...(q.explanation?.overall
              ? { encodingFormat: "text/plain", abstract: q.explanation.overall }
              : {}),
          },
        }
      : {}),
    isPartOf: {
      "@type": "LearningResource",
      name: `${exam.title ?? exam.exam_id} 過去問`,
      url: `https://goukaku.dev/fe/exam/${exam.exam_id}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "合格.dev",
        item: "https://goukaku.dev/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "基本情報技術者試験",
        item: "https://goukaku.dev/fe",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: exam.title ?? exam.exam_id,
        item: `https://goukaku.dev/fe/exam/${exam.exam_id}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `問${n}`,
        item: url,
      },
    ],
  };

  return (
    <MobileFrame>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PlayController
        questions={questions}
        exam={exam}
        mode="sequential"
        initialQNumber={n}
        stats={stats}
      />
    </MobileFrame>
  );
}
