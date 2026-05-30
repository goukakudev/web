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
    title: `${exam.label} 過去問 ${exam.question_count} 問`,
    description: `宅地建物取引士試験 ${exam.label} の過去問 ${exam.question_count} 問。関連条文・判例タップで本文ポップアップ表示・解説付き。`,
    path: `/takken/exams/${exam.exam_id}`,
  });
}

export default async function ExamDetailPage({ params }: Props) {
  const { examId } = await params;
  const [exam, questionsResult, allExams] = await Promise.all([
    TakkenAPI.getExam(examId),
    TakkenAPI.listExamQuestions(examId),
    TakkenAPI.listExams(),
  ]);
  if (!exam) notFound();
  const questions = questionsResult?.questions ?? [];
  const categoryCounts = new Map<string, number>();
  for (const q of questions) {
    if (!q.category) continue;
    categoryCounts.set(q.category, (categoryCounts.get(q.category) ?? 0) + 1);
  }
  const topCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);
  const sortedExams = [...allExams].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.exam_month - a.exam_month;
  });
  const currentIdx = sortedExams.findIndex((e) => e.exam_id === exam.exam_id);
  const newerExam = currentIdx > 0 ? sortedExams[currentIdx - 1] : null;
  const olderExam = currentIdx >= 0 && currentIdx < sortedExams.length - 1 ? sortedExams[currentIdx + 1] : null;
  const sameMonthExams = sortedExams
    .filter((e) => e.exam_month === exam.exam_month && e.exam_id !== exam.exam_id)
    .slice(0, 5);
  const intro =
    `宅地建物取引士試験 ${exam.label} の過去問演習ページです。` +
    `本ページから全 ${exam.question_count} 問を、通常演習 / 模試モード の 2 モードで解けます。` +
    `関連条文や判例をタップすると本文がポップアップ表示され、解説付きで理解を深められます。` +
    (exam.passing_score
      ? `合格点は ${exam.passing_score} 点で、過去の平均正答率もあわせて確認できます。`
      : ``) +
    `分野別の出題内訳は下記の「分野別の出題」を参照してください。`;

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

        <section className="mb-8">
          <h2 className="mb-3 font-mincho text-sm tracking-widest text-ink-3">
            このページについて
          </h2>
          <p className="text-[13px] leading-[1.85] text-ink-2">{intro}</p>
        </section>

        {topCategories.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-mincho text-sm tracking-widest text-ink-3">
              分野別の出題
            </h2>
            <ul className="grid grid-cols-2 gap-1.5">
              {topCategories.map(([cat, count]) => (
                <li key={cat}>
                  <Link
                    href={`/takken/categories/${encodeURIComponent(cat)}`}
                    className="flex items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-[12px] hover:bg-canvas"
                  >
                    <span className="font-mincho font-semibold text-ink">{cat}</span>
                    <span className="text-[11px] text-ink-3 tabular-nums">
                      {count} 問
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(newerExam || olderExam) && (
          <section className="mb-8">
            <h2 className="mb-3 font-mincho text-sm tracking-widest text-ink-3">
              前後の試験回
            </h2>
            <nav className="grid grid-cols-2 gap-2">
              {newerExam ? (
                <Link
                  href={`/takken/exams/${newerExam.exam_id}`}
                  className="rounded-lg border border-line bg-bg p-3 text-[12px] hover:bg-canvas"
                >
                  <div className="text-[10px] tracking-widest text-ink-3">← 新しい</div>
                  <div className="mt-1 font-mincho font-semibold text-ink">{newerExam.label}</div>
                  <div className="text-[11px] text-ink-3">{newerExam.question_count} 問</div>
                </Link>
              ) : (
                <span />
              )}
              {olderExam ? (
                <Link
                  href={`/takken/exams/${olderExam.exam_id}`}
                  className="rounded-lg border border-line bg-bg p-3 text-right text-[12px] hover:bg-canvas"
                >
                  <div className="text-[10px] tracking-widest text-ink-3">古い →</div>
                  <div className="mt-1 font-mincho font-semibold text-ink">{olderExam.label}</div>
                  <div className="text-[11px] text-ink-3">{olderExam.question_count} 問</div>
                </Link>
              ) : null}
            </nav>
          </section>
        )}

        {sameMonthExams.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-mincho text-sm tracking-widest text-ink-3">
              他の年の {exam.exam_month} 月実施分
            </h2>
            <p className="mb-2 text-[11px] text-ink-3">
              年度違いの同じ試験回で出題傾向を比較
            </p>
            <ul className="grid grid-cols-2 gap-1.5">
              {sameMonthExams.map((e) => (
                <li key={e.exam_id}>
                  <Link
                    href={`/takken/exams/${e.exam_id}`}
                    className="flex items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-[12px] hover:bg-canvas"
                  >
                    <span className="font-mincho font-semibold text-ink">{e.label}</span>
                    <span className="text-[11px] text-ink-3 tabular-nums">{e.question_count} 問</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {questions.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-mincho text-sm tracking-widest text-ink-3">
              収録問題一覧
            </h2>
            <p className="mb-2 text-[11px] text-ink-3">
              全 {questions.length} 問。クリックで問題ページへ
            </p>
            <ol className="space-y-1">
              {questions
                .slice()
                .sort((a, b) => a.question_number - b.question_number)
                .map((q) => (
                  <li key={q._id}>
                    <Link
                      href={`/takken/exams/${exam.exam_id}/quiz?q=${q.question_number}`}
                      className="flex items-baseline gap-2 rounded-md px-2 py-1 hover:bg-canvas"
                    >
                      <span className="w-[2.5em] shrink-0 text-[11px] font-bold text-ink-3 tabular-nums">
                        問{q.question_number}
                      </span>
                      <span className="truncate text-[12px] text-ink-2">
                        {q.question_text.slice(0, 60)}
                        {q.question_text.length > 60 ? "…" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
            </ol>
          </section>
        )}
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
