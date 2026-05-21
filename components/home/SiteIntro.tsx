import Link from "next/link";

export function SiteIntro() {
  return (
    <section className="mt-10 text-[13px] leading-[1.85] text-goukaku-ink/85">
      <h2 className="text-[18px] font-extrabold mb-3">
        合格.dev について
      </h2>
      <p className="mb-3">
        合格.dev は、独立行政法人情報処理推進機構 (IPA) が公表する{" "}
        <strong>基本情報技術者試験</strong> (FE) の過去問を無料で演習できる学習サイトです。13 年分・各回 80 問前後、合計 800 問以上を、すべて選択肢ごとの解説付きで掲載しています。
      </p>
      <p className="mb-3">
        会員登録は不要です。3 つの学習モード — <strong>順番に解く</strong> /{" "}
        <strong>ランダムに解く</strong> / <strong>模試形式 (時間計測あり)</strong> — を切り替えて、苦手分野の補強から本番形式の通し演習まで一貫して対応できます。
      </p>
      <h3 className="text-[15px] font-extrabold mt-5 mb-2">
        独自に編集した解説
      </h3>
      <p className="mb-3">
        各問題には <strong>「全体解説」+ 選択肢 4 つそれぞれの解説</strong> を用意しています。なぜ正解なのか、他の選択肢はなぜ違うのか、を一つずつ言語化することで、選択肢の引っかけパターンへの対応力を養えます。図表は再構築・ベクター化 (SVG) しており、Retina ディスプレイでも文字が滲みません。
      </p>
      <h3 className="text-[15px] font-extrabold mt-5 mb-2">
        対応している試験
      </h3>
      <p className="mb-3">
        現在、基本情報技術者試験の午前科目を中心に、平成 25 年度 (2013) ～ 令和 7 年度 (2025) の過去問を順次拡充しています。タグ機能により、データ構造・ネットワーク・セキュリティ・経営戦略など、分野横断での演習も可能です。
      </p>
      <h3 className="text-[15px] font-extrabold mt-5 mb-2">運営について</h3>
      <p className="mb-3">
        当サイトの問題文は IPA 公表の過去問に基づきますが、解説・図表・UI はすべて独自に制作したオリジナルです。詳しくは{" "}
        <Link href="/about" className="underline">
          About
        </Link>
        ・
        <Link href="/privacy" className="underline">
          プライバシーポリシー
        </Link>
        ・
        <Link href="/terms" className="underline">
          利用規約
        </Link>{" "}
        をご覧ください。
      </p>
    </section>
  );
}
