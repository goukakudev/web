import type { Metadata } from "next"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { IpIntentPage } from "@/components/seo/IpIntentPage"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "ITパスポート CBT対策と練習方法",
  description:
    "ITパスポート試験のCBT方式に慣れるための練習方法。120分100問の時間配分、前日までの確認、過去問復習の進め方を整理。",
  path: "/ip/cbt-practice",
  type: "article",
})

export default function IpCbtPracticePage() {
  return (
    <MobileFrame>
      <IpIntentPage
        title="ITパスポート CBT対策と練習方法"
        description="ITパスポート試験のCBT方式に慣れるための練習方法。120分100問の時間配分、前日までの確認、過去問復習の進め方を整理。"
        path="/ip/cbt-practice"
        lead="ITパスポート試験はCBT方式で実施されます。紙の試験と違い、画面上で問題を読み、選択肢を選び、残り時間を見ながら進める操作に慣れておくことが大切です。"
        primaryHref="/ip/mock"
        primaryLabel="CBT模試へ進む"
        sections={[
          {
            heading: "CBTで意識すること",
            body: "公式情報では、ITパスポート試験はコンピュータに表示された試験問題に対してマウスやキーボードを用いて解答する方式と説明されています。画面で長文を読む負荷、選択肢の見落とし、時間表示を見ながら進める感覚を事前に練習しておきます。",
          },
          {
            heading: "120分100問の進め方",
            body: "1周目は迷う問題に時間を使いすぎず、解ける問題を確実に取ります。2周目で計算問題や迷った問題を見直し、最後にマーク漏れを確認する流れを練習しておくと、本番でも慌てにくくなります。",
          },
          {
            heading: "合格基準を踏まえた復習",
            body: "ITパスポートは総合評価点600点以上、かつストラテジ系・マネジメント系・テクノロジ系の分野別評価点がそれぞれ300点以上であることが合格基準です。得意分野だけで総合点を取りに行くのではなく、分野別の最低ラインを割らない復習が必要です。",
            links: [
              { href: "/ip/category/strategy", label: "ストラテジ系" },
              { href: "/ip/category/management", label: "マネジメント系" },
              { href: "/ip/category/technology", label: "テクノロジ系" },
            ],
          },
        ]}
      />
    </MobileFrame>
  )
}
