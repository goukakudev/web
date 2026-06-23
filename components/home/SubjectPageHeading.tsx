export type SubjectKey = "fe" | "ip" | "ap" | "sg" | "sc" | "dk"

interface HeadingCopy {
  /** 可視 h1。本命キーワード「<試験名> 過去問」を含める。 */
  title: string
  /** h1 直下の 1〜2 行リード。無料・問題数・モードなど検索意図に答える語を含める。 */
  lead: string
}

const COPY: Record<SubjectKey, HeadingCopy> = {
  ip: {
    title: "ITパスポート試験 過去問",
    lead: "全 2,900 問（29 年分）を無料で。全問に解説・選択肢別解説・ヒント付き。順番／ランダム／模試（120 分）の 3 モードで演習できます。",
  },
  fe: {
    title: "基本情報技術者試験 過去問",
    lead: "科目 A の過去問 800 問以上（13 年分）を無料で。全問に解説・選択肢別解説付き。順番／ランダム／模試（90 分）で演習できます。",
  },
  ap: {
    title: "応用情報技術者試験 過去問",
    lead: "午前の過去問 1,440 問（18 回分）を無料で。全問に解説・選択肢別解説付き。順番／ランダム／模試（150 分）で演習できます。",
  },
  sg: {
    title: "情報セキュリティマネジメント試験 過去問",
    lead: "科目 A の公開過去問を無料で。全問に解説・選択肢別解説付き。順番／ランダム／模試（90 分）で演習できます。",
  },
  sc: {
    title: "情報処理安全確保支援士試験 過去問",
    lead: "午前 II の公開過去問を無料で。全問に解説付き。順番／ランダム／模試（40 分）で演習でき、登録セキスペ（RISS）対策に使えます。",
  },
  dk: {
    title: "第二種電気工事士 学科試験 過去問",
    lead: "第二種電気工事士の学科試験 39 回分・1,950 問を無料で。図入り問題も含めて、順番／ランダム／模試（120 分）で演習できます。",
  },
}

/**
 * 資格別入口ページ最上部の可視見出し。これまで h1 は sr-only で、本命キーワード
 * （例「ITパスポート 過去問」）に対応する可視の見出し・導入文が無かった。検索意図に
 * 答える 1 行リードと共に可視 h1 を出し、入口ページの評価を底上げする。
 */
export function SubjectPageHeading({ subject }: { subject: SubjectKey }) {
  const c = COPY[subject]
  return (
    <header className="mb-6">
      <h1 className="text-[20px] font-black leading-[1.25] tracking-tight">
        {c.title}
      </h1>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-goukaku-ink/65">
        {c.lead}
      </p>
    </header>
  )
}
