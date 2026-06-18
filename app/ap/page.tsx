import type { Metadata } from "next"
import { listApExams } from "@/lib/api-client"
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
  title: "応用情報技術者試験 過去問 + 解説",
  description:
    "応用情報技術者試験 (AP) の午前過去問を無料で。18 回分・各 80 問・全 1,440 問を、順番に / ランダムに / 150 分模試形式で解けます。全問解説・選択肢ごとの解説・ヒント付き。",
  path: "/ap",
})

export default async function ApHomePage() {
  const exams = await listApExams()
  return (
    <MobileFrame>
      <JsonLd
        data={itemListJsonLd(
          exams.map((e) => ({
            name: `${e.title ?? e.exam_id} 過去問`,
            url: `${SITE_URL}/ap/exam/${e.exam_id}`,
          })),
        )}
      />
      <JsonLd
        data={courseJsonLd({
          name: "応用情報技術者試験 過去問学習コース",
          description:
            "応用情報技術者試験 (AP) 午前の過去問 18 回分・全 1,440 問を解説・ヒント付きで無料演習。テクノロジ系 / マネジメント系 / ストラテジ系の 3 分野別学習に対応。",
          url: `${SITE_URL}/ap`,
          aboutName: "応用情報技術者試験",
          examYears: "平成 28 年度 (2016) 春期 〜 令和 7 年度 (2025) 春期",
          totalQuestions: exams.reduce((s, e) => s + (e.question_count ?? 0), 0),
          credentialName: "応用情報技術者",
        })}
      />
      <TopBar />
      <SubjectPageHeading subject="ap" />
      <HeroQuestCard subject="ap" />
      <ContinueSection exams={exams} subject="ap" />
      <BookmarkCard exams={exams} subject="ap" />
      <HistoryCard subject="ap" />
      <div className="grid grid-cols-2 gap-3 mb-7">
        <StatCard label="答えた" value={0} unit="問" icon="🔥" />
        <StatCard label="正答率" value={0} unit="%" icon="🎯" />
      </div>
      <NewExamsSection exams={exams} subject="ap" />
      <div
        className="mt-7 text-[22px] text-goukaku-pink-script"
        style={{ fontFamily: "var(--font-script)" }}
      >
        Subjects
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">学習カテゴリ</div>
      <div className="grid grid-cols-2 gap-3">
        {exams.map((exam, i) => (
          <SubjectTile key={exam.exam_id} exam={exam} index={i} subject="ap" />
        ))}
      </div>
      <MockTestBanner exam={exams[0]} subject="ap" />
      <SiteIntro subject="ap" />
    </MobileFrame>
  )
}
