import { listExams, listPopularTags } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { TopBar } from "@/components/home/TopBar"
import { HeroQuestCard } from "@/components/home/HeroQuestCard"
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

export const metadata = {
  title: "基本情報技術者試験 過去問 + 解説",
  description:
    "基本情報技術者試験の過去問を無料で。13 年分・各 80 問前後を、順番に / ランダムに / 模試形式で解けます。全問解説・選択肢ごとの解説付き。",
  alternates: { canonical: "/fe" },
}

export default async function FeHomePage() {
  const [exams, popularTags] = await Promise.all([
    listExams(),
    listPopularTags(20),
  ])
  return (
    <MobileFrame>
      <OnboardingFlow />
      <TopBar />
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
