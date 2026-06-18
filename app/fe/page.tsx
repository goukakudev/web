import type { Metadata } from "next"
import { listExams, listPopularTags } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { TopBar } from "@/components/home/TopBar"
import { HeroQuestCard } from "@/components/home/HeroQuestCard"
import { SubjectPageHeading } from "@/components/home/SubjectPageHeading"
import { StatCard } from "@/components/home/StatCard"
import { SubjectTile } from "@/components/home/SubjectTile"
import { PopularTags } from "@/components/home/PopularTags"
import { WeakTagsSection } from "@/components/home/WeakTagsSection"
import { ContinueSection } from "@/components/home/ContinueSection"
import { NewExamsSection } from "@/components/home/NewExamsSection"
import { MockTestBanner } from "@/components/home/MockTestBanner"
import { SiteIntro } from "@/components/home/SiteIntro"
import { BookmarkCard } from "@/components/home/BookmarkCard"
import { HistoryCard } from "@/components/home/HistoryCard"
import { OnboardingFlow } from "@/components/home/OnboardingFlow"
import { makeMetadata } from "@/lib/seo/metadata"
import { itemListJsonLd, courseJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"

export const metadata: Metadata = makeMetadata({
  title: "基本情報技術者試験 過去問 + 解説",
  description:
    "基本情報技術者試験の過去問を無料で。13 年分・各 80 問前後を、順番に / ランダムに / 模試形式で解けます。全問解説・選択肢ごとの解説付き。",
  path: "/fe",
})

export default async function FeHomePage() {
  const [exams, popularTags] = await Promise.all([
    listExams(),
    listPopularTags(20),
  ])
  return (
    <MobileFrame>
      <JsonLd
        data={itemListJsonLd(
          exams.map((e) => ({
            name: `${e.title ?? e.exam_id} 過去問`,
            url: `${SITE_URL}/fe/exam/${e.exam_id}`,
          })),
        )}
      />
      <JsonLd
        data={courseJsonLd({
          name: "基本情報技術者試験 過去問学習コース",
          description:
            "基本情報技術者試験 (FE) 科目A の過去問を解説付きで無料演習。13 年分・800 問以上を順番 / ランダム / 模試の 3 モードで学習。",
          url: `${SITE_URL}/fe`,
          aboutName: "基本情報技術者試験",
          examYears: "平成 25 年 (2013) 〜 令和 7 年 (2025)",
          totalQuestions: exams.reduce((s, e) => s + (e.question_count ?? 0), 0),
          credentialName: "基本情報技術者",
        })}
      />
      <OnboardingFlow />
      <TopBar />
      <SubjectPageHeading subject="fe" />
      <HeroQuestCard />
      <ContinueSection exams={exams} />
      <BookmarkCard exams={exams} />
      <HistoryCard />
      <div className="grid grid-cols-2 gap-3 mb-7">
        <StatCard label="答えた" value={0} unit="問" icon="🔥" />
        <StatCard label="正答率" value={0} unit="%" icon="🎯" />
      </div>
      <NewExamsSection exams={exams} />
      <div
        className="mt-7 text-[22px] text-goukaku-pink-script"
        style={{ fontFamily: "var(--font-script)" }}
      >
        Subjects
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">学習カテゴリ</div>
      <div className="grid grid-cols-2 gap-3">
        {exams.map((exam, i) => (
          <SubjectTile key={exam.exam_id} exam={exam} index={i} />
        ))}
      </div>
      <WeakTagsSection />
      <PopularTags tags={popularTags} />
      <MockTestBanner exam={exams[0]} />
      <SiteIntro />
    </MobileFrame>
  )
}
