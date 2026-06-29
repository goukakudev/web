import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { IpIntentPage } from "@/components/seo/IpIntentPage"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート 頻出テーマと過去問対策",
  description:
    "ITパスポート試験で頻出のストラテジ、マネジメント、テクノロジ、AI、DX、セキュリティを過去問ベースで整理。",
  path: "/ip/frequent-topics",
  type: "article",
})

export default function IpFrequentTopicsPage() {
  return (
    <MobileFrame>
      <IpIntentPage
        title="ITパスポート 頻出テーマと過去問対策"
        description="ITパスポート試験で頻出のストラテジ、マネジメント、テクノロジ、AI、DX、セキュリティを過去問ベースで整理。"
        path="/ip/frequent-topics"
        lead="頻出テーマは、単に出やすい用語を並べるだけではなく、どの分野でどの形に言い換えられるかを確認することが重要です。"
        primaryHref="/ip/questions"
        primaryLabel="頻出テーマの問題を探す"
        sections={[
          {
            heading: "ストラテジ系",
            body: "企業活動、法務、経営戦略、システム戦略が中心です。SWOT分析、損益分岐点、知的財産、請負契約、個人情報保護、DX推進などは選択肢の言い換えで問われやすいテーマです。",
            links: [
              { href: "/ip/category/strategy", label: "ストラテジ系を解く" },
              { href: "/glossary/SWOT分析", label: "SWOT分析" },
              { href: "/glossary/損益分岐点", label: "損益分岐点" },
            ],
          },
          {
            heading: "マネジメント系",
            body: "プロジェクトマネジメント、サービスマネジメント、システム監査が中心です。SLA、BCP、リスク対応、監査証拠、開発プロセスは、用語の目的と責任範囲を分けて覚える必要があります。",
            links: [
              { href: "/ip/category/management", label: "マネジメント系を解く" },
              { href: "/glossary/SLA", label: "SLA" },
              { href: "/glossary/BCP", label: "BCP" },
            ],
          },
          {
            heading: "テクノロジ系",
            body: "基礎理論、コンピュータシステム、技術要素が中心です。ネットワーク、データベース、セキュリティ、AI、アルゴリズムの基礎が広く出ます。苦手用語を見つけたら、同じタグの問題を続けて解くと定着しやすくなります。",
            links: [
              { href: "/ip/category/technology", label: "テクノロジ系を解く" },
              { href: "/ip/ai-dx-security", label: "AI・DX・セキュリティ" },
            ],
          },
        ]}
      />
    </MobileFrame>
  )
}
