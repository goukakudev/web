import Link from "next/link";
import { notFound } from "next/navigation";
import { TakkenAPI } from "@/lib/takken/api";
import type { Metadata } from "next";
import { makeMetadata } from "@/lib/seo/metadata";
import { learningResourceJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

type Props = { params: Promise<{ examId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { examId } = await params;
  const exam = await TakkenAPI.getExam(examId);
  if (!exam) return {};
  return makeMetadata({
    title: `${exam.label} 宅建過去問 ${exam.question_count} 問`,
    description: `宅地建物取引士試験 ${exam.label} の過去問 ${exam.question_count} 問。関連条文・判例タップで本文ポップアップ表示・解説付き。`,
    path: `/takken/exams/${exam.exam_id}`,
  });
}

export default async function ExamDetailPage({ params }: Props) {
  const { examId } = await params;
  const exam = await TakkenAPI.getExam(examId);
  if (!exam) notFound();

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Breadcrumbs items={[
          { name: "合格.dev", href: "/" },
          { name: "宅建", href: "/takken" },
          { name: "年度別", href: "/takken/exams" },
          { name: exam.label, href: `/takken/exams/${exam.exam_id}` },
        ]} />
        <JsonLd data={learningResourceJsonLd({
          name: `${exam.label} 宅建過去問`,
          description: `宅地建物取引士試験 ${exam.label} 全 ${exam.question_count} 問・解説付き`,
          url: `https://goukaku.dev/takken/exams/${exam.exam_id}`,
          numberOfItems: exam.question_count,
          aboutName: "宅地建物取引士試験",
        })} />

        {/* Hero */}
        <div className="mb-6 rounded-2xl bg-charcoal p-6 text-white">
          <p className="text-[10px] font-medium tracking-widest text-white/55">
            {exam.era === "令和" ? "REIWA" : "HEISEI"}
          </p>
          <h1 className="mt-1 font-mincho text-3xl font-medium tracking-wide">
            {exam.label}
          </h1>
          <div className="my-4 h-px bg-white/18" />
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] tracking-widest text-white/55">問題数</p>
              <p className="font-mincho text-xl font-medium">{exam.question_count}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-white/55">合格点</p>
              <p className="font-mincho text-xl font-medium">
                {exam.passing_score ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* 演習モード */}
        <section className="mb-8">
          <h2 className="mb-3 font-mincho text-sm tracking-widest text-ink-3">
            演習モード
          </h2>
          <div className="space-y-2.5">
            <Link
              href={`/takken/exams/${exam.exam_id}/quiz`}
              className="flex items-center gap-3.5 rounded-xl border border-line bg-bg p-3.5 transition hover:bg-canvas"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft">
                <BookIcon />
              </div>
              <div className="flex-1">
                <p className="font-mincho text-base text-ink">通常演習</p>
                <p className="text-xs text-ink-3">1問ずつ解答+解説確認</p>
              </div>
              <span className="text-ink-4">›</span>
            </Link>
            <Link
              href={`/takken/exams/${exam.exam_id}/quiz?mode=exam`}
              className="flex items-center gap-3.5 rounded-xl border border-line bg-bg p-3.5 transition hover:bg-canvas"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft">
                <TimerIcon />
              </div>
              <div className="flex-1">
                <p className="font-mincho text-base text-ink">模試モード</p>
                <p className="text-xs text-ink-3">50問通し・最後に採点</p>
              </div>
              <span className="text-ink-4">›</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
      <path d="M12 6.5C10 5 7.5 4.5 4 5v13c3.5-.5 6 0 8 1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6.5C14 5 16.5 4.5 20 5v13c-3.5-.5-6 0-8 1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6.5v13" strokeLinecap="round" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2M9 2h6M12 5v2" strokeLinecap="round" />
    </svg>
  );
}
