import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "第二種電気工事士 過去問 FAQ",
  description:
    "第二種電気工事士 学科試験の過去問演習に関するFAQ。収録範囲、図入り問題、ランダム出題、模試形式、解説について。",
  path: "/dk/faq",
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
    <MobileFrame>
      <Link href="/dk" className="inline-block text-[14px] mb-4">← 第二種電気工事士トップ</Link>
      <h1 className="text-[22px] font-extrabold mb-4">第二種電気工事士 過去問 FAQ</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <section key={item.q} className="rounded-2xl border border-goukaku-divider bg-goukaku-surface/40 p-4">
            <h2 className="text-[14px] font-extrabold mb-2">{item.q}</h2>
            <p className="text-[13px] leading-[1.8] text-goukaku-ink/75">{item.a}</p>
          </section>
        ))}
      </div>
    </MobileFrame>
  )
}
