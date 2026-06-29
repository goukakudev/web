import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { IpIntentPage } from "@/components/seo/IpIntentPage"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート 30日学習計画",
  description:
    "ITパスポート試験を30日で仕上げるための学習計画。基礎用語、分野別過去問、模試、直前復習の進め方を整理。",
  path: "/ip/30-days",
  type: "article",
})

export default function IpThirtyDaysPage() {
  return (
    <MobileFrame>
      <IpIntentPage
        title="ITパスポート 30日学習計画"
        description="ITパスポート試験を30日で仕上げるための学習計画。基礎用語、分野別過去問、模試、直前復習の進め方を整理。"
        path="/ip/30-days"
        lead="30日で進める場合は、全範囲を均等に読むより、用語の基礎確認、分野別過去問、模試、間違い直しを短い周期で回すことが重要です。"
        primaryHref="/ip/play/random?count=20"
        primaryLabel="今日の20問を始める"
        sections={[
          {
            heading: "1〜7日目: 全体像と基礎用語",
            body: "ストラテジ系・マネジメント系・テクノロジ系の大枠を確認し、頻出用語を一通り読みます。暗記に時間をかけすぎず、各用語がどの分野で問われるかを意識してください。",
            links: [{ href: "/ip/terms", label: "頻出用語まとめ" }],
          },
          {
            heading: "8〜20日目: 分野別に過去問を解く",
            body: "1日20〜40問を目安に、分野別の過去問を解きます。間違えた問題は正解だけで終わらせず、他の選択肢が違う理由まで読みます。選択肢の言い換えに慣れることが得点につながります。",
            links: [
              { href: "/ip/category/strategy", label: "ストラテジ系" },
              { href: "/ip/category/management", label: "マネジメント系" },
              { href: "/ip/category/technology", label: "テクノロジ系" },
            ],
          },
          {
            heading: "21〜27日目: 模試と弱点補強",
            body: "本番形式の模試を行い、分野別に失点を確認します。テクノロジ系のセキュリティ、ストラテジ系の法務・経営、マネジメント系のSLAやBCPなど、苦手タグを優先して戻ります。",
            links: [
              { href: "/ip/mock", label: "CBT模試" },
              { href: "/ip/frequent-topics", label: "頻出テーマ" },
            ],
          },
          {
            heading: "28〜30日目: 直前復習",
            body: "新しい範囲を増やしすぎず、間違えた問題、用語の取り違え、計算問題、セキュリティの基本を見直します。試験制度や持ち物、申込内容は必ず公式サイトで確認してください。",
            links: [{ href: "/ip/cbt-practice", label: "CBT対策" }],
          },
        ]}
      />
    </MobileFrame>
  )
}
