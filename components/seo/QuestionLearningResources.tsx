import Link from "next/link"

type ExamKey = "fe" | "ip" | "ap" | "sg" | "sc" | "kango" | "takken"

const COPY: Record<ExamKey, { full: string; abbrev: string; guide: string; faq: string; top: string; topLabel: string }> = {
  fe: {
    full: "基本情報技術者試験",
    abbrev: "FE",
    guide: "/fe/guide",
    faq: "/fe/faq",
    top: "/fe",
    topLabel: "FE トップ",
  },
  ip: {
    full: "ITパスポート試験",
    abbrev: "IP",
    guide: "/ip/guide",
    faq: "/ip/faq",
    top: "/ip",
    topLabel: "IP トップ",
  },
  ap: {
    full: "応用情報技術者試験",
    abbrev: "AP",
    guide: "/ap/guide",
    faq: "/ap/faq",
    top: "/ap",
    topLabel: "AP トップ",
  },
  sg: {
    full: "情報セキュリティマネジメント試験",
    abbrev: "SG",
    guide: "/sg/guide",
    faq: "/sg/faq",
    top: "/sg",
    topLabel: "SG トップ",
  },
  sc: {
    full: "情報処理安全確保支援士試験",
    abbrev: "SC",
    guide: "/sc/guide",
    faq: "/sc/faq",
    top: "/sc",
    topLabel: "SC トップ",
  },
  kango: {
    full: "看護師国家試験",
    abbrev: "看護",
    guide: "/kango/guide",
    faq: "/kango/faq",
    top: "/kango",
    topLabel: "看護トップ",
  },
  takken: {
    full: "宅地建物取引士試験",
    abbrev: "宅建",
    guide: "/takken/guide",
    faq: "/takken/faq",
    top: "/takken",
    topLabel: "宅建トップ",
  },
}

interface Props {
  examKey: ExamKey
}

export function QuestionLearningResources({ examKey }: Props) {
  const c = COPY[examKey]
  return (
    <aside
      aria-label={`${c.full} の学習リソース`}
      className="mt-8 rounded-2xl border border-goukaku-divider bg-goukaku-surface/40 p-5"
    >
      <h2 className="text-[14px] font-extrabold text-goukaku-ink/85 mb-2">
        {c.abbrev} の学習リソース
      </h2>
      <p className="text-[12px] leading-[1.85] text-goukaku-ink/70 mb-3">
        この問題で扱った分野をさらに深掘りしたい方へ。{c.full}の試験概要・出題範囲・合格基準・標準学習スケジュール・分野別の攻略法までを 1 ページに集約した<strong>独自編集の学習ガイド</strong>と、よくある質問をまとめた FAQ を用意しています。
      </p>
      <ul className="text-[12px] leading-[1.9] text-goukaku-ink/80 list-disc pl-5 mb-3">
        <li>解答に出てきた用語や手順を体系的にまとめて確認したいとき</li>
        <li>受験スケジュール・申込み方法・合格基準を改めて整理したいとき</li>
        <li>本サイトの「順番に解く / ランダム / 模試」など学習モードの使い分けを知りたいとき</li>
      </ul>
      <div className="flex flex-wrap gap-2">
        <Link
          href={c.guide}
          className="inline-flex items-center rounded-full border border-goukaku-divider bg-goukaku-surface px-3 py-1.5 text-[12px] font-extrabold text-goukaku-ink/80 hover:text-goukaku-ink"
        >
          📘 {c.abbrev} 学習ガイドを読む →
        </Link>
        <Link
          href={c.faq}
          className="inline-flex items-center rounded-full border border-goukaku-divider bg-goukaku-surface px-3 py-1.5 text-[12px] font-extrabold text-goukaku-ink/80 hover:text-goukaku-ink"
        >
          ❓ {c.abbrev} FAQ
        </Link>
        <Link
          href={c.top}
          className="inline-flex items-center rounded-full border border-goukaku-divider bg-goukaku-surface px-3 py-1.5 text-[12px] font-extrabold text-goukaku-ink/80 hover:text-goukaku-ink"
        >
          🏠 {c.topLabel}
        </Link>
      </div>
      <p className="mt-3 text-[11px] text-goukaku-ink/55 leading-[1.7]">
        この問題ページの解説・ヒント・分野タグ・関連問題リンクは、すべて合格.dev 編集部による独自編集です (問題文・選択肢は試験団体の公表過去問の引用)。詳しくは{" "}
        <Link href="/about" className="underline">編集方針</Link>{" "}
        ・{" "}
        <Link href="/sources" className="underline">出典一覧</Link>
        {" "}を参照してください。
      </p>
    </aside>
  )
}
