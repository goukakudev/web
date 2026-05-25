import Link from "next/link";
import type { Metadata } from "next";
import { TakkenAPI, type TakkenExam } from "@/lib/takken/api";
import { makeMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = makeMetadata({
  title: "宅建 年度別過去問",
  description: "宅地建物取引士試験の過去問を年度別に。H16〜R7 までの全試験を掲載。",
  path: "/takken/exams",
});

export default async function ExamsPage() {
  const exams = await TakkenAPI.listExams();
  const reiwa = exams.filter((e) => e.era === "令和");
  const heisei = exams.filter((e) => e.era === "平成");

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Breadcrumbs items={[
          { name: "合格.dev", href: "/" },
          { name: "宅建", href: "/takken" },
          { name: "年度別", href: "/takken/exams" },
        ]} />
        <JsonLd data={itemListJsonLd(exams.map((e) => ({
          name: `${e.label} 宅建過去問`,
          url: `https://goukaku.dev/takken/exams/${e.exam_id}`,
        })))} />

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
