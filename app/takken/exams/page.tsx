import Link from "next/link";
import { TakkenAPI, type TakkenExam } from "@/lib/takken/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "年度別 — 宅建",
  description: "宅建士試験の年度別過去問演習。H16〜R7まで24試験すべて。",
};

export default async function ExamsPage() {
  const exams = await TakkenAPI.listExams();
  const reiwa = exams.filter((e) => e.era === "令和");
  const heisei = exams.filter((e) => e.era === "平成");

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-8 text-xs tracking-widest text-ink-3">
          <Link href="/" className="hover:text-ink-2">合格.dev</Link>
          <span className="mx-2">／</span>
          <Link href="/takken" className="hover:text-ink-2">宅建</Link>
          <span className="mx-2">／</span>
          <span>年度別</span>
        </nav>

        <h1 className="mb-8 font-mincho text-3xl font-semibold tracking-wide text-ink">
          年度別に学習
        </h1>

        {reiwa.length > 0 && (
          <Section title="令和">
            {reiwa.map((e) => <ExamCard key={e.exam_id} exam={e} />)}
          </Section>
        )}

        {heisei.length > 0 && (
          <Section title="平成">
            {heisei.map((e) => <ExamCard key={e.exam_id} exam={e} />)}
          </Section>
        )}
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-mincho text-sm tracking-widest text-ink-3">
        {title}
      </h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function ExamCard({ exam }: { exam: TakkenExam }) {
  const eraChar = exam.era === "令和" ? "R" : "H";
  const gradient =
    exam.era === "令和"
      ? "from-[#b89770] to-[#8c6a4a]"
      : "from-[#737a73] to-[#474a47]";
  return (
    <Link
      href={`/takken/exams/${exam.exam_id}`}
      className="flex items-center gap-3.5 rounded-2xl border border-line bg-bg p-3.5 transition hover:bg-canvas"
    >
      <div
        className={`flex h-[60px] w-[60px] flex-col items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}
      >
        <span className="text-[9px] font-medium tracking-widest text-white/70">
          {eraChar}
        </span>
        <span className="font-mincho text-2xl font-medium text-white">
          {exam.era_year}
        </span>
      </div>
      <div className="flex-1">
        <p className="font-mincho text-base text-ink">{exam.label}</p>
        <p className="mt-1 text-xs text-ink-3">
          {exam.question_count}問
          {exam.passing_score && ` ・合格点 ${exam.passing_score}点`}
        </p>
      </div>
      <span className="text-ink-4">›</span>
    </Link>
  );
}
