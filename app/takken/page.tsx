import Link from "next/link";
import { TakkenAPI } from "@/lib/takken/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "宅建士",
  description: "宅建士試験(宅地建物取引士)過去問演習。H16〜R7の24試験・1,200問+解説を収録。",
};

export default async function TakkenHome() {
  const exams = await TakkenAPI.listExams();
  const latest = exams[0];

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-8 text-xs tracking-widest text-ink-3">
          <Link href="/" className="hover:text-ink-2">合格.dev</Link>
          <span className="mx-2">／</span>
          <span>宅建</span>
        </nav>

        <header className="mb-10">
          <h1 className="font-mincho text-4xl font-semibold tracking-wide text-ink">
            宅建過去問
          </h1>
          <p className="mt-2 text-xs tracking-widest text-ink-3">
            宅地建物取引士試験対策
          </p>
        </header>

        {/* Hero */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-charcoal p-6 text-white">
          <p className="text-[10px] font-medium tracking-widest text-white/55">
            学習の進捗
          </p>
          <p className="mt-2 font-mincho text-2xl font-medium">
            {exams.length}試験・{exams.reduce((s, e) => s + e.question_count, 0)}問収録
          </p>
          <p className="mt-1 text-sm text-white/70">
            H16〜{latest?.label ?? "R7"} までの全試験
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          {latest && (
            <Link
              href={`/takken/exams/${latest.exam_id}`}
              className="btn-primary w-full"
            >
              最新年度から始める ({latest.label})
            </Link>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/takken/exams" className="btn-secondary">
              年度別に学習
            </Link>
            <Link href="/takken/categories" className="btn-secondary">
              分野別に学習
            </Link>
          </div>
        </div>

        <footer className="mt-16 border-t border-line pt-6 text-xs text-ink-3">
          <p>過去問データは公式公開問題に基づく。解説は学習用参考表記。</p>
        </footer>
      </div>
    </main>
  );
}
