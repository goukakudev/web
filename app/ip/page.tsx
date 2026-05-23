import Link from "next/link"
import { listIpExams } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"

export const metadata = {
  title: "ITパスポート試験 過去問 + 解説",
  description:
    "ITパスポート試験の過去問を無料で。29 年分・各 100 問・全 2,900 問を、順番に / ランダムに / 模試形式で解けます。全問解説・選択肢ごとの解説・ヒント付き。",
  alternates: { canonical: "/ip" },
}

export default async function IpHomePage() {
  const exams = await listIpExams()
  const totalQuestions = exams.reduce((s, e) => s + e.question_count, 0)
  const latest = exams[0]

  return (
    <MobileFrame>
      <div className="pt-4">
        <nav className="mb-6 text-xs tracking-widest text-goukaku-ink/60">
          <Link href="/" className="hover:text-goukaku-ink">合格.dev</Link>
          <span className="mx-2">／</span>
          <span>ITパスポート</span>
        </nav>

        <header className="mb-7">
          <div
            className="text-[22px] text-goukaku-pink-script"
            style={{ fontFamily: "var(--font-script)" }}
          >
            IT Passport
          </div>
          <h1 className="text-[28px] font-black leading-tight">
            ITパスポート 過去問
          </h1>
          <p className="mt-1 text-[13px] text-goukaku-ink/60">
            国家試験 (情報処理推進機構) — 全 {exams.length} 試験・{totalQuestions} 問収録
          </p>
        </header>

        <Link
          href="/ip/play/random?count=20"
          className="block bg-goukaku-lime rounded-[28px] p-5 relative mb-6"
        >
          <div
            className="text-[22px] text-goukaku-ink-fixed"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Today&apos;s quest
          </div>
          <div className="mt-1 text-[24px] font-black leading-tight text-goukaku-ink-fixed">
            全試験からランダム 20 問
          </div>
          <div className="mt-3.5 inline-flex gap-2 items-center px-4 py-2.5 bg-goukaku-ink-fixed text-goukaku-lime rounded-full font-extrabold text-[14px]">
            挑戦する →
          </div>
          <span className="absolute top-3.5 right-4 text-goukaku-pink-script text-[20px]">✦</span>
        </Link>

        {latest && (
          <Link
            href={`/ip/exam/${latest.exam_id}`}
            className="block bg-goukaku-surface rounded-[24px] p-5 mb-6"
          >
            <div className="text-[11px] font-medium tracking-widest text-goukaku-ink/55">
              最新試験
            </div>
            <div className="mt-1 text-[18px] font-extrabold">
              {latest.title}
            </div>
            <div className="mt-1 text-[12px] text-goukaku-ink/60">
              {latest.question_count} 問
            </div>
          </Link>
        )}

        <div
          className="mt-7 text-[22px] text-goukaku-pink-script"
          style={{ fontFamily: "var(--font-script)" }}
        >
          All exams
        </div>
        <div className="text-[18px] font-extrabold mb-3.5">全試験</div>
        <div className="grid grid-cols-2 gap-3">
          {exams.map((exam) => (
            <Link
              key={exam.exam_id}
              href={`/ip/exam/${exam.exam_id}`}
              className="rounded-[20px] bg-goukaku-surface p-4"
            >
              <div className="w-10 h-10 rounded-full bg-goukaku-lime flex items-center justify-center text-[16px] mb-2.5">
                📘
              </div>
              <div className="text-[13px] font-bold leading-tight line-clamp-2">
                {exam.title}
              </div>
              <div className="mt-2 text-[11px] text-goukaku-ink/60">
                {exam.question_count} 問
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MobileFrame>
  )
}
