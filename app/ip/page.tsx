import type { Metadata } from "next"
import { listIpExams } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { TopBar } from "@/components/home/TopBar"
import { HeroQuestCard } from "@/components/home/HeroQuestCard"
import { SubjectPageHeading } from "@/components/home/SubjectPageHeading"
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

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート試験 過去問 + 解説",
  description:
    "ITパスポート試験の過去問を無料で。29 年分・各 100 問・全 2,900 問を、順番に / ランダムに / 模試形式で解けます。全問解説・選択肢ごとの解説・ヒント付き。",
  path: "/ip",
})

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
            "ITパスポート試験 (IP) の過去問 29 年分・全 2,900 問を解説・ヒント付きで無料演習。ストラテジ / マネジメント / テクノロジの 3 分野別学習に対応。",
          url: `${SITE_URL}/ip`,
          aboutName: "ITパスポート試験",
          examYears: "平成 9 年 (1997) 〜 令和 7 年 (2025)",
          totalQuestions: exams.reduce((s, e) => s + (e.question_count ?? 0), 0),
          credentialName: "ITパスポート",
        })}
      />
      <TopBar />
      <SubjectPageHeading subject="ip" />
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
      <MockTestBanner exam={exams[0]} subject="ip" />
      <SiteIntro subject="ip" />
    </MobileFrame>
  )
}
