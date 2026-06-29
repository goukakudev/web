import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { IpIntentPage } from "@/components/seo/IpIntentPage"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート 頻出用語まとめ",
  description:
    "ITパスポート試験で問われやすいAI、DX、セキュリティ、経営、プロジェクトマネジメント、データベースの用語を過去問演習へつなげて整理。",
  path: "/ip/terms",
  type: "article",
})

export default function IpTermsPage() {
  return (
    <MobileFrame>
      <IpIntentPage
        title="ITパスポート 頻出用語まとめ"
        description="ITパスポート試験で問われやすいAI、DX、セキュリティ、経営、プロジェクトマネジメント、データベースの用語を過去問演習へつなげて整理。"
        path="/ip/terms"
        lead="ITパスポートは用語暗記だけではなく、用語がどの文脈で問われるかを理解する試験です。用語ページと過去問解説を往復して、意味と選択肢の見分け方を結び付けます。"
        primaryHref="/ip/questions"
        primaryLabel="用語が出る問題を探す"
        sections={[
          {
            heading: "AI・DXで押さえる用語",
            body: "機械学習、生成AI、RPA、IoT、ビッグデータ、データ利活用、DX推進などは、単語の定義だけでなく、活用例や導入目的とセットで問われます。",
            links: [
              { href: "/glossary/機械学習", label: "機械学習" },
              { href: "/glossary/RPA", label: "RPA" },
              { href: "/ip/ai-dx-security", label: "AI・DX・セキュリティ対策" },
            ],
          },
          {
            heading: "セキュリティで押さえる用語",
            body: "PKI、共通鍵暗号方式、公開鍵暗号方式、認証、マルウェア、リスクマネジメントなどは、似た用語の違いを問われやすい分野です。暗号方式は鍵の使い方、認証は本人性と正当性、リスク管理はプロセスの順序を確認します。",
            links: [
              { href: "/glossary/PKI", label: "PKI" },
              { href: "/glossary/共通鍵暗号方式", label: "共通鍵暗号方式" },
            ],
          },
          {
            heading: "経営・マネジメントで押さえる用語",
            body: "SWOT分析、損益分岐点、SLA、BCP、プロジェクトマネジメント、サービスマネジメントは、計算・目的・適用場面がセットで出題されます。定義を覚えたら、過去問で選択肢の言い換えに慣れてください。",
            links: [
              { href: "/glossary/SWOT分析", label: "SWOT分析" },
              { href: "/glossary/損益分岐点", label: "損益分岐点" },
              { href: "/glossary/SLA", label: "SLA" },
              { href: "/glossary/BCP", label: "BCP" },
            ],
          },
        ]}
      />
    </MobileFrame>
  )
}
