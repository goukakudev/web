import type { Metadata } from "next"
import { listDkExams } from "@/lib/api-client"
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
  title: "第二種電気工事士 学科試験 過去問 + 解説",
  description:
    "第二種電気工事士の学科試験過去問を無料で。図入り問題を含む39回分・1,950問を、順番に / ランダムに / 模試形式で解けます。全問解説・選択肢ごとの解説・ヒント付き。",
  path: "/dk",
})

export default async function DkHomePage() {
  const exams = await listDkExams()
  return (
    <MobileFrame>
      <JsonLd
        data={itemListJsonLd(
          exams.map((e) => ({
            name: `${e.title ?? e.exam_id} 過去問`,
            url: `${SITE_URL}/dk/exam/${e.exam_id}`,
          })),
        )}
      />
      <JsonLd
        data={courseJsonLd({
          name: "第二種電気工事士 学科試験 過去問学習コース",
          description:
            "第二種電気工事士の学科試験過去問を解説・ヒント付きで無料演習。電気理論・配電設計・配線図・施工方法・検査・法令の分野別学習に対応。",
          url: `${SITE_URL}/dk`,
          aboutName: "第二種電気工事士 学科試験",
          examYears: "平成21年(2009)〜令和8年(2026)",
          totalQuestions: exams.reduce((s, e) => s + (e.question_count ?? 0), 0),
          credentialName: "第二種電気工事士",
        })}
      />
      <TopBar />
      <SubjectPageHeading subject="dk" />
      <HeroQuestCard subject="dk" />
      <ContinueSection exams={exams} subject="dk" />
      <BookmarkCard exams={exams} subject="dk" />
      <HistoryCard subject="dk" />
      <div className="grid grid-cols-2 gap-3 mb-7">
        <StatCard label="答えた" value={0} unit="問" icon="🔥" />
        <StatCard label="正答率" value={0} unit="%" icon="🎯" />
      </div>
      <NewExamsSection exams={exams} subject="dk" />
      <div
        className="mt-7 text-[22px] text-goukaku-pink-script"
        style={{ fontFamily: "var(--font-script)" }}
      >
        Exams
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">収録試験回</div>
      <div className="grid grid-cols-2 gap-3">
        {exams.map((exam, i) => (
          <SubjectTile key={exam.exam_id} exam={exam} index={i} subject="dk" />
        ))}
      </div>
      <MockTestBanner exam={exams[0]} subject="dk" />
      <SiteIntro subject="dk" />
    </MobileFrame>
  )
}
