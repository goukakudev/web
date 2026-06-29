import type { Metadata } from "next"
import Link from "next/link"
import { listIpExams } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { TopBar } from "@/components/home/TopBar"
import { HeroQuestCard } from "@/components/home/HeroQuestCard"
import { SubjectPageHeading } from "@/components/home/SubjectPageHeading"
import { SubjectCategoryLinks } from "@/components/home/SubjectCategoryLinks"
import { SubjectYearLinks } from "@/components/home/SubjectYearLinks"
import { StatCard } from "@/components/home/StatCard"
import { SubjectTile } from "@/components/home/SubjectTile"
import { ContinueSection } from "@/components/home/ContinueSection"
import { NewExamsSection } from "@/components/home/NewExamsSection"
import { MockTestBanner } from "@/components/home/MockTestBanner"
import { SiteIntro } from "@/components/home/SiteIntro"
import { BookmarkCard } from "@/components/home/BookmarkCard"
import { HistoryCard } from "@/components/home/HistoryCard"
import { makeMetadata } from "@/lib/seo/metadata"
import { itemListJsonLd, courseJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"

export async function generateMetadata(): Promise<Metadata> {
  const exams = await listIpExams()
  const total = exams.reduce((sum, exam) => sum + (exam.question_count ?? 0), 0)
  const totalText = total > 0 ? `全${total.toLocaleString("ja-JP")}問` : "全問"
  return makeMetadata({
    title: "ITパスポート過去問 無料 29回分2700問 全問解説・模試",
    description:
      `無料・登録不要・スマホ最適化。ITパスポート試験の過去問を平成21年〜令和8年・${totalText}収録。順番／ランダム／CBT模試で演習でき、全問に解説と独自の選択肢別解説・ヒント付き。`,
    path: "/ip",
  })
}

export default async function IpHomePage() {
  const exams = await listIpExams()
  return (
    <MobileFrame>
      <JsonLd
        data={itemListJsonLd(
          exams.map((e) => ({
            name: `${e.title ?? e.exam_id} 過去問`,
            url: `${SITE_URL}/ip/exam/${e.exam_id}`,
          })),
        )}
      />
      <JsonLd
        data={courseJsonLd({
          name: "ITパスポート試験 過去問学習コース",
          description:
            "ITパスポート試験 (IP) の過去問 29 回分・全 2,700 問を解説・ヒント付きで無料演習。ストラテジ / マネジメント / テクノロジの 3 分野別学習に対応。",
          url: `${SITE_URL}/ip`,
          aboutName: "ITパスポート試験",
          examYears: "平成 21 年 (2009) 〜 令和 8 年 (2026)",
          totalQuestions: exams.reduce((s, e) => s + (e.question_count ?? 0), 0),
          credentialName: "ITパスポート",
        })}
      />
      <TopBar />
      <SubjectPageHeading subject="ip" />
      <section className="mb-6 rounded-xl border border-goukaku-divider bg-goukaku-surface/45 p-4">
        <h2 className="text-[15px] font-extrabold text-goukaku-ink">
          ITパスポート対策メニュー
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { href: "/ip/questions", label: "過去問解説" },
            { href: "/ip/mock", label: "CBT模試" },
            { href: "/ip/terms", label: "頻出用語" },
            { href: "/ip/30-days", label: "30日計画" },
            { href: "/ip/frequent-topics", label: "頻出テーマ" },
            { href: "/ip/ai-dx-security", label: "AI・DX・セキュリティ" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-goukaku-divider bg-white/45 px-3 py-2 text-[12px] font-extrabold text-goukaku-ink/78"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
      <HeroQuestCard subject="ip" />
      <ContinueSection exams={exams} subject="ip" />
      <BookmarkCard exams={exams} subject="ip" />
      <HistoryCard subject="ip" />
      <div className="grid grid-cols-2 gap-3 mb-7">
        <StatCard label="答えた" value={0} unit="問" icon="🔥" />
        <StatCard label="正答率" value={0} unit="%" icon="🎯" />
      </div>
      <NewExamsSection exams={exams} subject="ip" />
      <div
        className="mt-7 text-[22px] text-goukaku-pink-script"
        style={{ fontFamily: "var(--font-script)" }}
      >
        Subjects
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">学習カテゴリ</div>
      <div className="grid grid-cols-2 gap-3">
        {exams.map((exam, i) => (
          <SubjectTile key={exam.exam_id} exam={exam} index={i} subject="ip" />
        ))}
      </div>
      <SubjectCategoryLinks subject="ip" />
      <SubjectYearLinks subject="ip" exams={exams} />
      <MockTestBanner exam={exams[0]} subject="ip" />
      <SiteIntro subject="ip" />
    </MobileFrame>
  )
}
