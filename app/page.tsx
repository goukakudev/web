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

export default async function HomePage() {
  const [exams, popularTags] = await Promise.all([
    listExams(),
    listPopularTags(20),
  ])
  return (
    <MobileFrame>
      <TopBar />
      <HeroQuestCard />
      <ContinueSection exams={exams} />
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
