import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { IpIntentPage } from "@/components/seo/IpIntentPage"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート AI・DX・セキュリティ対策",
  description:
    "ITパスポート試験で問われるAI、DX、データ利活用、情報セキュリティを、頻出用語と過去問解説へのリンクで整理。",
  path: "/ip/ai-dx-security",
  type: "article",
})

export default function IpAiDxSecurityPage() {
  return (
    <MobileFrame>
      <IpIntentPage
        title="ITパスポート AI・DX・セキュリティ対策"
        description="ITパスポート試験で問われるAI、DX、データ利活用、情報セキュリティを、頻出用語と過去問解説へのリンクで整理。"
        path="/ip/ai-dx-security"
        lead="AI・DX・セキュリティは近年のITパスポートで重要度が高い領域です。用語の定義だけでなく、利用目的、導入時の注意点、リスク対策までセットで確認します。"
        primaryHref="/ip/questions"
        primaryLabel="関連する過去問を探す"
        sections={[
          {
            heading: "AIは手法と利用例を分ける",
            body: "機械学習、深層学習、生成AI、自然言語処理、画像認識などは、どのようなデータから何を学習・生成するかを整理します。ITパスポートでは高度な数式よりも、業務での活用例や注意点が問われやすい傾向があります。",
            links: [{ href: "/glossary/機械学習", label: "機械学習" }],
          },
          {
            heading: "DXは目的と手段を混同しない",
            body: "DXは単なるデジタル化ではなく、データとデジタル技術を使って業務やビジネスモデルを変える考え方です。RPA、BI、IoT、クラウド、データ分析はDXを支える手段として出題されます。",
            links: [{ href: "/glossary/RPA", label: "RPA" }],
          },
          {
            heading: "セキュリティは仕組みとリスクで覚える",
            body: "暗号、認証、アクセス制御、マルウェア対策、リスクマネジメントは、似た言葉の違いが問われます。共通鍵暗号方式と公開鍵暗号方式、PKI、デジタル署名、ゼロトラストなどは、目的と仕組みを分けて復習します。",
            links: [
              { href: "/glossary/PKI", label: "PKI" },
              { href: "/glossary/共通鍵暗号方式", label: "共通鍵暗号方式" },
              { href: "/glossary/ゼロトラスト", label: "ゼロトラスト" },
            ],
          },
        ]}
      />
    </MobileFrame>
  )
}
