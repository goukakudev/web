import Link from "next/link";
import type { QuizSubject } from "@/lib/exam-utils";

interface SubjectCopy {
  fullName: string;
  shortName: string;
  abbrev: string;
  authority: string;
  authorityShort: string;
  rangeLabel: string;
  totalLabel: string;
  modesLine: string;
  scopeLine: string;
  rangePrefix: string;
}

const COPY: Record<QuizSubject, SubjectCopy> = {
  fe: {
    fullName: "基本情報技術者試験",
    shortName: "基本情報技術者試験",
    abbrev: "FE",
    authority: "独立行政法人情報処理推進機構 (IPA)",
    authorityShort: "IPA",
    rangeLabel: "13 年分",
    totalLabel: "各回 80 問前後、合計 800 問以上",
    modesLine:
      "3 つの学習モード — 順番に解く / ランダムに解く / 模試形式 (90 分・時間計測あり) — を切り替えて、苦手分野の補強から本番形式の通し演習まで一貫して対応できます。",
    scopeLine:
      "現在、基本情報技術者試験の午前科目を中心に、平成 25 年度 (2013) ～ 令和 7 年度 (2025) の過去問を順次拡充しています。タグ機能により、データ構造・ネットワーク・セキュリティ・経営戦略など、分野横断での演習も可能です。",
    rangePrefix: "平成 25 年度 (2013)",
  },
  ip: {
    fullName: "ITパスポート試験",
    shortName: "ITパスポート試験",
    abbrev: "IP",
    authority: "独立行政法人情報処理推進機構 (IPA)",
    authorityShort: "IPA",
    rangeLabel: "29 回分",
    totalLabel: "合計 2,700 問",
    modesLine:
      "3 つの学習モード — 順番に解く / ランダムに解く / 模試形式 (120 分・時間計測あり) — を切り替えて、苦手分野の補強から本番形式の通し演習まで一貫して対応できます。問題ごとにヒントも参照可能です。",
    scopeLine:
      "現在、IT パスポート試験の全分野(ストラテジ系・マネジメント系・テクノロジ系)を網羅し、公開されている年度の過去問を順次拡充しています。タグ機能により、情報セキュリティ・経営戦略・データベースなど、分野横断での演習も可能です。",
    rangePrefix: "公開過去問",
  },
  ap: {
    fullName: "応用情報技術者試験",
    shortName: "応用情報技術者試験",
    abbrev: "AP",
    authority: "独立行政法人情報処理推進機構 (IPA)",
    authorityShort: "IPA",
    rangeLabel: "18 回分",
    totalLabel: "各回 80 問、合計 1,440 問",
    modesLine:
      "3 つの学習モード — 順番に解く / ランダムに解く / 模試形式 (150 分・時間計測あり) — を切り替えて、苦手分野の補強から本番形式の通し演習まで一貫して対応できます。問題ごとにヒントも参照可能です。",
    scopeLine:
      "現在、応用情報技術者試験の午前科目について、平成 28 年度 (2016) 春期 〜 令和 7 年度 (2025) 春期の過去問を収録しています。タグ機能により、ネットワーク・データベース・セキュリティ・アルゴリズム・経営戦略など、分野横断での演習も可能です。",
    rangePrefix: "平成 28 年度 (2016) 春期",
  },
  sg: {
    fullName: "情報セキュリティマネジメント試験",
    shortName: "情報セキュリティマネジメント試験",
    abbrev: "SG",
    authority: "独立行政法人情報処理推進機構 (IPA)",
    authorityShort: "IPA",
    rangeLabel: "公開過去問",
    totalLabel: "科目 A の四肢択一問題",
    modesLine:
      "3 つの学習モード — 順番に解く / ランダムに解く / 模試形式 (90 分・時間計測あり) — を切り替えて、苦手分野の補強から本番形式の通し演習まで一貫して対応できます。問題ごとにヒントも参照可能です。",
    scopeLine:
      "現在、情報セキュリティマネジメント試験の科目 A について、平成 28 年度 (2016) 〜 令和 7 年度 (2025) の公開過去問を収録しています。タグ機能により、情報セキュリティ・リスク管理・関連法規など、分野横断での演習も可能です。",
    rangePrefix: "平成 28 年度 (2016)",
  },
  sc: {
    fullName: "情報処理安全確保支援士試験",
    shortName: "情報処理安全確保支援士試験",
    abbrev: "SC",
    authority: "独立行政法人情報処理推進機構 (IPA)",
    authorityShort: "IPA",
    rangeLabel: "公開過去問",
    totalLabel: "午前 II の多肢選択問題",
    modesLine:
      "3 つの学習モード — 順番に解く / ランダムに解く / 模試形式 (40 分・時間計測あり) — を切り替えて、苦手分野の補強から本番形式の通し演習まで一貫して対応できます。問題ごとにヒントも参照可能です。",
    scopeLine:
      "現在、情報処理安全確保支援士試験の午前 II について、公開過去問を順次収録しています。午前 I (高度共通) の演習は応用情報技術者試験 (AP) ページをご利用ください。タグ機能により、暗号・認証・ネットワークセキュリティ・マルウェア対策・セキュリティマネジメントなど、分野横断での演習も可能です。",
    rangePrefix: "令和年度",
  },
  dk: {
    fullName: "第二種電気工事士 学科試験",
    shortName: "第二種電気工事士",
    abbrev: "DK",
    authority: "一般財団法人電気技術者試験センター",
    authorityShort: "電気技術者試験センター",
    rangeLabel: "39 回分",
    totalLabel: "各回 50 問、合計 1,950 問",
    modesLine:
      "3 つの学習モード — 順番に解く / ランダムに解く / 模試形式 (120 分・時間計測あり) — を切り替えて、計算問題・配線図・器具鑑別・法令を横断的に演習できます。図入り問題にも対応しています。",
    scopeLine:
      "現在、第二種電気工事士の学科試験について、平成 21 年 (2009) 〜 令和 8 年 (2026) の公開過去問を収録しています。タグ機能により、電気理論・配電設計・配線図・工具・施工方法・検査・法令など、分野横断での演習も可能です。",
    rangePrefix: "平成 21 年 (2009)",
  },
};

export function SiteIntro({ subject = "fe" }: { subject?: QuizSubject }) {
  const c = COPY[subject];
  const guideHref = `/${subject}/guide`;
  const faqHref = `/${subject}/faq`;
  return (
    <section className="mt-10 text-[13px] leading-[1.85] text-goukaku-ink/85">
      <h2 className="text-[18px] font-extrabold mb-3">
        合格.dev について
      </h2>
      <p className="mb-3">
        合格.dev は、{c.authority}が公表する{" "}
        <strong>{c.fullName}</strong> ({c.abbrev}) の過去問を無料で演習できる学習サイトです。{c.rangeLabel}・{c.totalLabel}を、すべて選択肢ごとの解説付きで掲載しています。
      </p>
      <p className="mb-3">
        会員登録は不要です。{c.modesLine}
      </p>
      <h3 className="text-[15px] font-extrabold mt-5 mb-2">
        独自に編集した解説
      </h3>
      <p className="mb-3">
        各問題には <strong>「全体解説」+ 選択肢 4 つそれぞれの解説</strong> を用意しています。なぜ正解なのか、他の選択肢はなぜ違うのか、を一つずつ言語化することで、選択肢の引っかけパターンへの対応力を養えます。図表は再構築・ベクター化 (SVG) しており、Retina ディスプレイでも文字が滲みません。問題本文は公表過去問の引用、解説・ヒント・タグ・関連用語はすべて当サイトが独自に編集した二次著作物です (詳細は{" "}
        <Link href="/about" className="underline">編集方針</Link>)。
      </p>
      <h3 className="text-[15px] font-extrabold mt-5 mb-2">
        対応している試験
      </h3>
      <p className="mb-3">{c.scopeLine}</p>

      <h3 className="text-[15px] font-extrabold mt-5 mb-2">
        この試験をはじめて受ける方へ
      </h3>
      <p className="mb-3">
        {c.fullName}の試験概要、出題範囲、合格基準、標準学習スケジュール、分野別の攻略法までを 1 ページに集約した{" "}
        <strong>独自編集の学習ガイド</strong>{" "}
        と、よくある質問をまとめた FAQ を用意しています。これから受験を検討する段階の方は、まずこちらをご覧ください。
      </p>
      <div className="mt-3 mb-5 flex flex-wrap gap-2">
        <Link
          href={guideHref}
          className="inline-flex items-center rounded-full border border-goukaku-divider bg-goukaku-surface px-3.5 py-1.5 text-[12px] font-extrabold text-goukaku-ink/80 transition hover:text-goukaku-ink"
        >
          📘 {c.abbrev} 学習ガイドを読む →
        </Link>
        <Link
          href={faqHref}
          className="inline-flex items-center rounded-full border border-goukaku-divider bg-goukaku-surface px-3.5 py-1.5 text-[12px] font-extrabold text-goukaku-ink/80 transition hover:text-goukaku-ink"
        >
          ❓ {c.abbrev} FAQ
        </Link>
      </div>

      <h3 className="text-[15px] font-extrabold mt-5 mb-2">運営について</h3>
      <p className="mb-3">
        当サイトの問題文は {c.authorityShort} 公表の過去問に基づきますが、解説・図表・UI はすべて独自に制作したオリジナルです。詳しくは{" "}
        <Link href="/about" className="underline">About</Link>
        ・
        <Link href="/methodology" className="underline">編集方針 (詳細)</Link>
        ・
        <Link href="/sources" className="underline">出典一覧</Link>
        ・
        <Link href="/privacy" className="underline">プライバシーポリシー</Link>
        ・
        <Link href="/terms" className="underline">利用規約</Link>{" "}
        をご覧ください。
      </p>
    </section>
  );
}
