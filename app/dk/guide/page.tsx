import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = makeMetadata({
  title: "第二種電気工事士 学科試験 学習ガイド",
  description:
    "第二種電気工事士 学科試験の過去問演習ガイド。電気理論、配電設計、配線図、器具鑑別、施工方法、検査、法令の学習順と模試の使い方を整理します。",
  path: "/dk/guide",
})

export default function DkGuidePage() {
  return (
    <MobileFrame>
      <Link href="/dk" className="inline-block text-[14px] mb-4">← 第二種電気工事士トップ</Link>
      <h1 className="text-[22px] font-extrabold mb-4">第二種電気工事士 学科試験 学習ガイド</h1>
      <div className="space-y-5 text-[13px] leading-[1.85] text-goukaku-ink/80">
        <p>
          まず電気理論・配電設計の計算問題を固め、次に配線図、工具・材料、施工方法、検査、法令を過去問で往復します。図入り問題は本文だけで判断せず、図中の記号・器具名・配線条件をセットで確認してください。
        </p>
        <section>
          <h2 className="text-[16px] font-extrabold mb-2 text-goukaku-ink">おすすめの進め方</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>最初の1周は年度を選んで順番に解き、出題の型を把握する。</li>
            <li>2周目はタグやランダム出題で苦手分野だけを混ぜて解く。</li>
            <li>仕上げは最新回から模試形式で解き、120分内に50問を処理する練習をする。</li>
          </ul>
        </section>
        <section>
          <h2 className="text-[16px] font-extrabold mb-2 text-goukaku-ink">図入り問題の見方</h2>
          <p>
            配線図・器具写真・図記号の問題は、問題文、図、選択肢の対応関係が崩れないように表示時の選択肢シャッフルを止めています。選択肢が画像内にある問題は「図中のイ」のような表示で選んでください。
          </p>
        </section>
      </div>
    </MobileFrame>
  )
}
