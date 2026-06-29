import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { IpIntentPage } from "@/components/seo/IpIntentPage"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート 勉強ロードマップ",
  description:
    "ITパスポート試験のストラテジ系・マネジメント系・テクノロジ系を、過去問演習と用語確認で進める学習ロードマップ。",
  path: "/ip/roadmap",
  type: "article",
})

export default function IpRoadmapPage() {
  return (
    <MobileFrame>
      <IpIntentPage
        title="ITパスポート 勉強ロードマップ"
        description="ITパスポート試験のストラテジ系・マネジメント系・テクノロジ系を、過去問演習と用語確認で進める学習ロードマップ。"
        path="/ip/roadmap"
        lead="ITパスポートは3分野を広く問う試験です。最初から全範囲を完璧に読むより、公式シラバスの大枠を押さえ、過去問で問われ方を確認しながら弱点を戻る進め方が実用的です。"
        sections={[
          {
            heading: "1. 全体像をつかむ",
            body: "最初にストラテジ系、マネジメント系、テクノロジ系の3分野を把握します。公式情報では出題分野の目安として、ストラテジ系35問程度、マネジメント系20問程度、テクノロジ系45問程度が示されています。",
            links: [{ href: "/ip/guide", label: "試験概要を読む" }],
          },
          {
            heading: "2. 用語と過去問を往復する",
            body: "用語集で定義を読み、すぐに関連する過去問を解きます。用語だけを覚えるより、選択肢の言い換え、誤答選択肢の作られ方、似た概念との違いを見た方が得点につながります。",
            links: [
              { href: "/ip/terms", label: "頻出用語" },
              { href: "/ip/questions", label: "過去問解説一覧" },
            ],
          },
          {
            heading: "3. 模試で分野別の穴を見つける",
            body: "模試では総合点だけで判断せず、分野別にどこで失点したかを確認します。特にテクノロジ系は用語・計算・セキュリティが混ざるため、間違えた問題をタグ単位で復習します。",
            links: [{ href: "/ip/mock", label: "CBT模試へ" }],
          },
        ]}
      />
    </MobileFrame>
  )
}
