import { listIpExams } from "@/lib/api-client"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { TopBar } from "@/components/home/TopBar"
import { HeroQuestCard } from "@/components/home/HeroQuestCard"
import { StatCard } from "@/components/home/StatCard"
import { SubjectTile } from "@/components/home/SubjectTile"
import { ContinueSection } from "@/components/home/ContinueSection"
import { NewExamsSection } from "@/components/home/NewExamsSection"
import { MockTestBanner } from "@/components/home/MockTestBanner"
import { SiteIntro } from "@/components/home/SiteIntro"
import { BookmarkCard } from "@/components/home/BookmarkCard"
import { HistoryCard } from "@/components/home/HistoryCard"

export const metadata = {
  title: "ITパスポート試験 過去問 + 解説",
  description:
    "ITパスポート試験の過去問を無料で。29 年分・各 100 問・全 2,900 問を、順番に / ランダムに / 模試形式で解けます。全問解説・選択肢ごとの解説・ヒント付き。",
  alternates: { canonical: "/ip" },
}

export default async function IpHomePage() {
  const exams = await listIpExams()
  return (
    <MobileFrame>
      <TopBar />
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
      <SiteIntro />
    </MobileFrame>
  )
}
