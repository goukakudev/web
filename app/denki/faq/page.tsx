import type { Metadata } from "next"
import { DenkiFrame } from "@/components/denki/DenkiFrame"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "第二種電気工事士 過去問 FAQ",
  description:
    "第二種電気工事士 学科試験の過去問演習に関するFAQ。収録範囲、図入り問題、ランダム出題、模試形式、解説について。",
  path: "/denki/faq",
})

export default function DkFaqPage() {
  const items = [
    {
      q: "収録範囲はどこまでですか？",
      a: "平成21年(2009)から令和8年(2026)までの公開学科試験39回分、合計1,950問を収録しています。",
    },
    {
      q: "図入り問題も解けますか？",
      a: "はい。配線図、器具写真、図記号、画像選択肢を含む問題も表示します。画像選択肢では元の図中ラベルとの対応を保つため、選択肢シャッフルを止めています。",
    },
    {
      q: "模試形式の時間は何分ですか？",
      a: "第二種電気工事士の学科試験に合わせて120分です。途中で回答しても、結果画面で正答数を確認できます。",
    },
    {
      q: "解説は公式の転載ですか？",
      a: "問題文・図版は公開過去問に基づき、解説・ヒント・タグは合格.dev側で独自に編集しています。",
    },
  ]

  return (
    <DenkiFrame
      title="第二種電気工事士 過去問 FAQ"
      eyebrow="FAQ"
      description="収録範囲、図入り問題、模試時間、解説方針についてまとめています。"
    >
      <div className="space-y-3">
        {items.map((item) => (
          <section key={item.q} className="rounded-lg border border-[#d8d1bc] bg-[#fffdf6] p-4">
            <h2 className="mb-2 text-[14px] font-black text-[#191815]">{item.q}</h2>
            <p className="text-[13px] leading-[1.8] text-[#4d473a]">{item.a}</p>
          </section>
        ))}
      </div>
    </DenkiFrame>
  )
}
