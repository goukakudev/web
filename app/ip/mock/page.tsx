import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { IpIntentPage } from "@/components/seo/IpIntentPage"
import { listIpExams } from "@/lib/api-client"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート CBT模試・過去問演習",
  description:
    "ITパスポート試験のCBT本番を意識して、120分・100問の過去問演習に取り組むためのページ。時間配分、復習方法、分野別の見直し方を整理。",
  path: "/ip/mock",
  type: "article",
})

export default async function IpMockPage() {
  const exams = await listIpExams()
  const latest = exams[0]
  return (
    <MobileFrame>
      <IpIntentPage
        title="ITパスポート CBT模試・過去問演習"
        description="ITパスポート試験のCBT本番を意識して、120分・100問の過去問演習に取り組むためのページ。"
        path="/ip/mock"
        lead="ITパスポート試験はCBT方式で随時実施され、試験時間は120分、出題数は100問です。合格.devでは過去問を使って、時間を区切った演習と解説復習を行えます。"
        primaryHref={latest ? `/ip/play/${latest.exam_id}?mode=exam` : "/ip/play/random?count=100"}
        primaryLabel="本番形式で模試を始める"
        sections={[
          {
            heading: "本番前に確認したい時間配分",
            body: "100問を120分で解くため、1問あたりの目安は約1分です。計算問題や長文問題に時間を使いすぎると後半の見直しが難しくなるため、迷った問題は一度選んで進み、最後に戻る運用を練習しておくと安定します。",
          },
          {
            heading: "模試後に見るべきポイント",
            body: "点数だけではなく、ストラテジ系・マネジメント系・テクノロジ系のどこで落としているかを確認します。ITパスポートは総合評価点だけでなく分野別評価点も必要なので、苦手分野を放置しないことが重要です。",
            links: [
              { href: "/ip/frequent-topics", label: "頻出テーマを見る" },
              { href: "/ip/roadmap", label: "学習ロードマップ" },
            ],
          },
          {
            heading: "解説ページで復習する",
            body: "間違えた問題は、正解だけでなく他の選択肢が違う理由まで確認します。用語を忘れていた場合は用語ページへ移動し、同じ年度・同じタグの関連問題も続けて解くと定着しやすくなります。",
            links: [{ href: "/ip/questions", label: "過去問解説一覧" }],
          },
        ]}
      />
    </MobileFrame>
  )
}
