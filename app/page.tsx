import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter } from "@/components/layout/SiteFooter"
import styles from "./home.module.css"
import { latestPassRate, type ExamKey } from "@/lib/pass-rates"
import { makeMetadata } from "@/lib/seo/metadata"
import { itemListJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"

export const metadata: Metadata = makeMetadata({
  title: "合格.dev — IPA国家試験の過去問解説サイト",
  description:
    "ITパスポート・基本情報・応用情報・情報セキュリティマネジメント・情報処理安全確保支援士、第二種電気工事士、宅建、看護師国家試験の過去問を無料演習。解説・模試付き。",
  path: "/",
})

type Category = {
  slug: string
  href: string
  label: string
  sub: string
  description: string
  icon: CategoryIconName
  status: "available" | "coming-soon"
  iosUrl?: string
}

type CategoryIconName =
  | "book"
  | "terminal"
  | "lock"
  | "monitor"
  | "shield"
  | "bolt"
  | "home"
  | "medical"

const CATEGORIES: Category[] = [
  {
    slug: "ip",
    href: "/ip",
    label: "ITパスポート試験",
    sub: "IT Passport Exam",
    description:
      "29 回分・全 2,700 問の過去問。解説・ヒント・選択肢ごとの正誤付き",
    icon: "book",
    status: "available",
    iosUrl: "https://apps.apple.com/jp/app/goukaku-itパスポート-過去問/id6774202965",
  },
  {
    slug: "fe",
    href: "/fe",
    label: "基本情報技術者試験",
    sub: "Fundamental IT Engineer",
    description:
      "13 年分・各 80 問前後の過去問。順番 / ランダム / 模試で解けます",
    icon: "terminal",
    status: "available",
    iosUrl: "https://apps.apple.com/jp/app/基本情報技術者-過去問/id6770801070",
  },
  {
    slug: "sg",
    href: "/sg",
    label: "情報セキュリティマネジメント試験",
    sub: "Information Security Management",
    description:
      "情報セキュリティマネジメント試験(SG)の公開過去問。科目A(四択)を順番 / ランダム / 模試で解けます",
    icon: "lock",
    status: "available",
    iosUrl: "https://apps.apple.com/app/goukaku-情報セキュリティマネジメント-過去問/id6776073219",
  },
  {
    slug: "ap",
    href: "/ap",
    label: "応用情報技術者試験",
    sub: "Applied IT Engineer",
    description:
      "応用情報技術者試験(AP)の午前過去問。順番 / ランダム / 模試で解けます",
    icon: "monitor",
    status: "available",
    iosUrl: "https://apps.apple.com/jp/app/goukaku-応用情報技術者-過去問/id6774940499",
  },
  {
    slug: "sc",
    href: "/sc",
    label: "情報処理安全確保支援士試験",
    sub: "Registered Information Security Specialist",
    description:
      "情報処理安全確保支援士(SC・登録セキスペ)の午前 II 過去問を順次収録。順番 / ランダム / 模試 (40 分) で解け、午前 I 免除制度・登録制度の解説も独自編集で公開",
    icon: "shield",
    status: "available",
    iosUrl: "https://apps.apple.com/jp/app/goukaku-情報処理安全確保支援士-過去問/id6777353500",
  },
  {
    slug: "dk",
    href: "/denki",
    label: "第二種電気工事士",
    sub: "Second-Class Electrician",
    description:
      "第二種電気工事士 学科試験の過去問。図入り問題を含む39回分・1,950問を順番 / ランダム / 模試で解けます",
    icon: "bolt",
    status: "available",
    iosUrl: "https://apps.apple.com/jp/app/第二種電気工事士-過去問演/id6782514809",
  },
  {
    slug: "takken",
    href: "/takken",
    label: "宅地建物取引士",
    sub: "Real Estate Transaction Agent",
    description: "宅建の過去問。関連条文・判例タップで本文ポップアップ表示",
    icon: "home",
    status: "available",
    iosUrl: "https://apps.apple.com/jp/app/宅建過去問/id6772390931",
  },
  {
    slug: "kango",
    href: "/kango",
    label: "看護師国家試験",
    sub: "National Nursing Examination",
    description:
      "看護師・保健師・助産師 国家試験の過去問。選択肢別解説付きで順番 / ランダムに解けます",
    icon: "medical",
    status: "available",
    iosUrl: "https://apps.apple.com/jp/app/goukaku-看護師免許-過去問/id6777429272",
  },
]

const APP_STORE_BADGE_SRC = "/app-store-badge-ja.svg"

function slugToExamKey(slug: string): ExamKey | null {
  switch (slug) {
    case "fe": return "fe"
    case "ip": return "ip"
    case "ap": return "ap"
    case "sg": return "sg"
    case "sc": return "sc"
    case "takken": return "tk"
    default: return null
  }
}

const BADGE_BASE =
  "inline-flex items-center justify-center h-10 rounded-md select-none"
const BADGE_DISABLED = "opacity-40 grayscale cursor-not-allowed"

const COVERAGE: Record<string, string> = {
  ip: "29回分・2,700問 / ストラテジ・マネジメント・テクノロジ",
  fe: "2013〜2025年・800問以上 / 90分模試",
  sg: "2016〜2025年の科目A公開過去問 / 90分模試",
  ap: "2016〜2025年・午前18回分1,440問 / 150分模試",
  sc: "レベル4（高度試験）・午前II公開過去問 / 40分模試",
  dk: "2009〜2026年・39回分1,950問 / 120分模試",
  takken: "2004〜2025年・24試験約1,200問 / 4分野",
  kango: "第115回ほか / 看護師・保健師・助産師",
}

const STUDY_GROUPS = [
  { id: "it-exams", number: "01", label: "IT・情報系", note: "デジタルの知識を、確かな強みに。", slugs: ["ip", "fe", "sg", "ap", "sc"] },
  { id: "professional-exams", number: "02", label: "仕事・暮らしの資格", note: "専門知識を、次の仕事につなげる。", slugs: ["dk", "takken"] },
  { id: "medical-exams", number: "03", label: "医療・看護系", note: "誰かを支える、その一歩のために。", slugs: ["kango"] },
]

export default function CategoriesPage() {
  return (
    <div className={styles.page}>
      <JsonLd
        data={itemListJsonLd(
          CATEGORIES.filter((c) => c.status === "available").map((c) => ({
            name: c.label,
            url: SITE_URL + c.href,
          })),
        )}
      />
      <a href="#main" className={styles.skipLink}>本文へ移動</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.wordmark} aria-label="合格.dev ホーム">Goukaku<span>.dev</span></Link>
          <nav className={styles.navigation} aria-label="メインメニュー">
            <a href="#exams">資格を選ぶ</a>
            <a href="#how-it-works">学び方</a>
            <a href="#faq">よくある質問</a>
            <a href="#exams" className={styles.headerCta}>学習をはじめる <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span aria-hidden="true">✳</span> SMALL STEPS. REAL POSSIBILITIES.</p>
            <p className={styles.heroCategory}>IPA国家試験・国家資格の過去問演習</p>
            <h1 id="hero-title" aria-label="IPA国家試験・各種資格の過去問演習サイト 合格.dev"><span>独学でも、<br />合格できる。</span></h1>
            <p className={styles.mission}>合格から、人生を変えられる。</p>
            <p className={styles.heroLead}>一問解いて、理由がわかる。<br />その積み重ねが、明日の自信になる。<br />あなたの挑戦を、過去問と解説で支えます。</p>
            <a href="#exams" className={styles.primaryButton}>資格を選んで、はじめる <span aria-hidden="true">↗</span></a>
            <p className={styles.heroNote}>無料で学習 <span aria-hidden="true">/</span> 会員登録不要 <span aria-hidden="true">/</span> スマホでも、PCでも</p>
          </div>
          <div className={styles.studyVisual}>
            <div className={styles.visualOrbit} aria-hidden="true" />
            <div className={styles.visualLabel}><span aria-hidden="true">✦</span> その「わかった」が、力になる。</div>
            <div className={styles.sampleCard}>
              <div className={styles.sampleTop}><span>LEARNING PREVIEW</span><span>01 / 01</span></div>
              <p className={styles.sampleTag}>ITの基礎を、一問から。</p>
              <p className={styles.sampleQuestion}>2進数の「101」を<br />10進数で表すと？</p>
              <div className={styles.sampleChoices} aria-label="例題の選択肢と正解">
                <span><small>A</small>3</span><span className={styles.correctChoice}><small>B</small>5<i aria-hidden="true">✓</i><span className="sr-only">正解</span></span>
                <span><small>C</small>6</span><span><small>D</small>8</span>
              </div>
              <div className={styles.sampleExplanation}><span>答えの、その先へ。</span><p>1 × 4 ＋ 0 × 2 ＋ 1 × 1 ＝ 5<br />仕組みがわかると、次の問題も解ける。</p></div>
              <p className={styles.sampleCaption}>学習画面のイメージ（例題）</p>
            </div>
            <div className={styles.stepNote}><span className={styles.stepIcon} aria-hidden="true">↗</span><div><small>ONE QUESTION AT A TIME</small><p>できる自分へ、一歩ずつ。</p></div></div>
          </div>
          <div className={styles.heroBottom}><span>LEARN. UNDERSTAND. MOVE FORWARD.</span><a href="#exams"><span aria-hidden="true">↓</span> FIND YOUR NEXT CHALLENGE</a></div>
        </section>

        <section className={styles.introStrip} aria-label="学習サービスについて"><div>
          <p><strong>8</strong><span>つの試験から、<br />あなたの目標を。</span></p>
          <p><span className={styles.stripMark} aria-hidden="true">01—</span><span>過去問に取り組む</span></p>
          <p><span className={styles.stripMark} aria-hidden="true">02—</span><span>解説で理解する</span></p>
          <p><span className={styles.stripMark} aria-hidden="true">03—</span><span>自信をつける</span></p>
        </div></section>

        <section id="exams" className={styles.examSection} aria-labelledby="exams-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / FIND YOUR EXAM</p><h2 id="exams-title">あなたの「なりたい」から、<br />学びを選ぼう。</h2></div><p>ブラウザーで、今すぐ一問。<br />iOSアプリでも、いつもの学びを。</p></div>
          <nav className={styles.groupNavigation} aria-label="試験の分野">
            {STUDY_GROUPS.map((group) => <a href={"#" + group.id} key={group.id}>{group.label}<span>{group.slugs.length}</span><i aria-hidden="true">↓</i></a>)}
          </nav>
          {STUDY_GROUPS.map((group) => (
            <section id={group.id} className={styles.examGroup} key={group.id} aria-labelledby={group.id + "-title"}>
              <div className={styles.groupHeading}><h3 id={group.id + "-title"}><span>{group.number}</span>{group.label}</h3><p>{group.note}</p></div>
              <div className={styles.examGrid}>
                {CATEGORIES.filter((c) => group.slugs.includes(c.slug)).map((c) => <ExamCard key={c.slug} category={c} />)}
              </div>
            </section>
          ))}
          <p className={styles.catalogNote}>合格率は各試験の公表統計に基づく参考情報です。サービス利用者の合格率を示すものではありません。</p>
        </section>

        <section id="how-it-works" className={styles.methodSection} aria-labelledby="method-title"><div className={styles.sectionInner}>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / YOUR WAY TO LEARN</p><h2 id="method-title">覚えるだけで、<br />終わらせない。</h2></div><p>今の自分に合う学び方で。<br />苦手の見直しから、本番前の仕上げまで。</p></div>
          <div className={styles.methodGrid}>
            <article><span className={styles.methodNumber}>01</span><div className={styles.methodDiagram} aria-hidden="true"><i>1</i><i>2</i><i>3</i><span>→</span></div><p className={styles.eyebrow}>STEP BY STEP</p><h3>順番に、じっくり。</h3><p>年度ごとの過去問を、一問ずつ。問題と解説を読みながら、知識の土台をつくります。</p></article>
            <article><span className={styles.methodNumber}>02</span><div className={styles.methodDiagram} aria-hidden="true"><i>7</i><i>3</i><i>9</i><span>↗</span></div><p className={styles.eyebrow}>MIX IT UP</p><h3>ランダムに、確かめる。</h3><p>順番に頼らず、理解を確かめる。さまざまな問題に触れて、知識の抜けを見つけます。</p></article>
            <article><span className={styles.methodNumber}>03</span><div className={styles.timerDiagram} aria-hidden="true"><svg viewBox="0 0 80 80"><circle cx="40" cy="43" r="26" /><path d="M40 26v17l12 8M32 7h16M40 7v9M60 18l5-5" /></svg></div><p className={styles.eyebrow}>READY FOR THE DAY</p><h3>模試で、本番に備える。</h3><p>時間を意識しながら、力試し。時間計測と採点で、最後まで解き切る感覚をつかみます。</p></article>
          </div>
          <p className={styles.modeNote}>利用できる学習モードは試験によって異なります。各試験ページで確認できます。</p>
        </div></section>

        <section className={styles.understandingSection} aria-labelledby="understanding-title"><div className={styles.understandingLayout}>
          <div className={styles.understandingCopy}><p className={styles.eyebrow}>03 / BEYOND THE ANSWER</p><h2 id="understanding-title">正解の理由まで、<br />あなたの知識に。</h2><p>答えを選べた、その先にある「なぜ」。<br />小さな疑問を、一つずつ理解へつなげます。</p><Link href="/about" className={styles.textLink}>合格.devについて <span aria-hidden="true">↗</span></Link></div>
          <div className={styles.featureList}>
            <article><span>01</span><div><h3>独自編集の解説</h3><p>全体解説と選択肢別解説で、なぜ正解か、ほかがなぜ違うかを言葉に。引っかけパターンへの対応力を養います。</p></div></article>
            <article><span>02</span><div><h3>用語から、理解を深める</h3><p>知らない言葉は用語の説明へ。宅建では、関連条文や判例をタップして本文を確認できます。</p></div></article>
            <article><span>03</span><div><h3>図表も、読みやすく</h3><p>過去問の図表を再構築・ベクター化。スマートフォンでも細かな文字や図を追いながら学べます。</p></div></article>
          </div>
        </div></section>

        <section id="faq" className={styles.faqSection} aria-labelledby="faq-title"><div className={styles.faqLayout}>
          <div><p className={styles.eyebrow}>04 / GOOD TO KNOW</p><h2 id="faq-title">はじめる前の、<br />小さな疑問に。</h2><Link href="/support" className={styles.textLink}>サポートを見る <span aria-hidden="true">↗</span></Link></div>
          <div className={styles.faqList}>
            <details><summary><span>01</span>完全無料ですか？<i aria-hidden="true">＋</i></summary><p>はい。会員登録もありません。広告は最小限に抑えて運営しています。</p></details>
            <details><summary><span>02</span>解説の信頼性は？<i aria-hidden="true">＋</i></summary><p>問題文は各実施団体の公開過去問に基づき、解説は本サイト独自の要約です。公式見解ではないため、最終的な解釈は公式資料でご確認ください。</p></details>
            <details><summary><span>03</span>スマホでも使えますか？<i aria-hidden="true">＋</i></summary><p>スマートフォン・PCのブラウザーから利用できます。各試験のiOSアプリは、試験一覧のApp Storeボタンから開けます。</p></details>
          </div>
        </div></section>

        <section className={styles.closingSection} aria-labelledby="closing-title"><div><p className={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE.</p><h2 id="closing-title">未来の自分に、<br />今日の一問を。</h2><a className={styles.primaryButton} href="#exams">学びたい資格を選ぶ <span aria-hidden="true">↗</span></a><p>無料・会員登録不要ではじめられます。</p></div><span className={styles.closingStar} aria-hidden="true">✳</span></section>
        <section className={styles.siteNote} aria-label="サービスと掲載問題について"><p>合格.dev（ごうかく / goukaku.dev）は、IPA国家試験を中心に過去問・解説・用語リンク・模試を提供する学習サイトです。公式サイトではありません。</p><p>掲載している試験問題は、各実施団体が公開する過去問題を利用しています。解説文は本サイト独自の要約であり、公式見解を示すものではありません。</p></section>
      </main>
      <SiteFooter variant="landing" />
    </div>
  )
}

function ExamCard({ category: c }: { category: Category }) {
  const examKey = slugToExamKey(c.slug)
  const latest = examKey ? latestPassRate(examKey) : null
  const titleId = "exam-card-title-" + c.slug
  return (
    <article className={styles.examCard} data-subject={c.slug}>
      <div className={styles.examCardMain}>
        <div className={styles.examCardTop}><CategoryIcon name={c.icon} /><span>{c.slug === "takken" ? "TAKKEN" : c.slug === "kango" ? "NURSING" : c.slug === "dk" ? "DENKI" : c.slug.toUpperCase()}</span><i aria-hidden="true">↗</i></div>
        <h3 id={titleId}>{c.label}</h3><p className={styles.examEnglish}>{c.sub}</p>
        <p className={styles.examDescription}>{c.description}</p>
        <p className={styles.coverage}>{COVERAGE[c.slug]}</p>
        {latest && <p className={styles.passRate}><PassRateIcon /><span>{latest.displayYear} 試験合格率 {(latest.passRate * 100).toFixed(1)}%</span></p>}
        {c.status === "available" ? <Link href={c.href} aria-labelledby={titleId} className={styles.examLink}><span className="sr-only">{c.label}</span></Link> : <span className={styles.unavailable}>準備中</span>}
      </div>
      <div className={styles.examCardBottom}><span>iOSアプリでも学べます</span><StoreBadge testId={"store-ios-" + c.slug} src={APP_STORE_BADGE_SRC} alt={c.label + " を App Store でダウンロード"} href={c.iosUrl} unavailableLabel="App Store 準備中" /></div>
    </article>
  )
}

function CategoryIcon({ name }: { name: CategoryIconName }) {
  return (
    <span className={styles.categoryIcon}>
      <svg
        data-home-icon={name}
        viewBox="0 0 48 48"
        className="size-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <IconShape name={name} />
      </svg>
    </span>
  )
}

function IconShape({ name }: { name: CategoryIconName }) {
  switch (name) {
    case "book":
      return (
        <>
          <path d="M13 10h14a6 6 0 0 1 6 6v22H18a5 5 0 0 0-5 5V10Z" />
          <path d="M18 38h17V14" />
          <path d="M19 18h8M19 24h10M19 30h6" />
          <path d="M13 36a5 5 0 0 1 5-5h15" opacity=".35" />
        </>
      )
    case "terminal":
      return (
        <>
          <path d="M9 16a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V16Z" />
          <path d="M17 21l5 4-5 4" />
          <path d="M25 30h8" />
          <path d="M15 40h18" opacity=".35" />
        </>
      )
    case "lock":
      return (
        <>
          <path d="M14 23h20v15H14V23Z" />
          <path d="M18 23v-5a6 6 0 0 1 12 0v5" />
          <path d="M24 29v4" />
          <path d="M12 13l12-6 12 6" opacity=".35" />
        </>
      )
    case "monitor":
      return (
        <>
          <path d="M9 12h30v21H9V12Z" />
          <path d="M18 39h12M24 33v6" />
          <path d="M16 20h16M16 25h10" />
          <path d="M34 18v9" opacity=".35" />
        </>
      )
    case "shield":
      return (
        <>
          <path d="M24 7 37 12v11c0 8-5.2 14.6-13 18-7.8-3.4-13-10-13-18V12l13-5Z" />
          <path d="M18 24h12M24 18v12" />
          <path d="M16 15l8-3 8 3" opacity=".35" />
        </>
      )
    case "bolt":
      return (
        <>
          <path d="M27 5 12 27h11l-2 16 15-23H25l2-15Z" />
          <path d="M14 12h8M31 35h5" opacity=".35" />
        </>
      )
    case "home":
      return (
        <>
          <path d="M10 23 24 11l14 12" />
          <path d="M14 22v17h20V22" />
          <path d="M21 39v-9h6v9" />
          <path d="M30 14v-4h5v9" opacity=".35" />
        </>
      )
    case "medical":
      return (
        <>
          <path d="M19 11h10v8h8v10h-8v8H19v-8h-8V19h8v-8Z" />
          <path d="M15 40c-4-2-6-5-6-9M33 40c4-2 6-5 6-9" opacity=".35" />
        </>
      )
  }
}

function PassRateIcon() {
  return (
    <svg
      data-home-icon="pass-rate"
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 2h6v3a3 3 0 0 1-6 0V2Z" />
      <path d="M5 4H2.5c0 2 1 3.2 2.8 3.6M11 4h2.5c0 2-1 3.2-2.8 3.6" />
      <path d="M8 8v3M5.5 14h5M6.5 11h3" />
    </svg>
  )
}

function StoreBadge({
  testId,
  src,
  alt,
  href,
  unavailableLabel,
}: {
  testId: string
  src: string
  alt: string
  href?: string
  unavailableLabel: string
}) {
  if (href) {
    return (
      <a
        data-testid={testId}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={alt}
        className={BADGE_BASE}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={109} height={40} loading="lazy" decoding="async" />
      </a>
    )
  }

  return (
    <span
      data-testid={testId}
      role="link"
      aria-disabled="true"
      aria-label={`${alt} (${unavailableLabel})`}
      title={unavailableLabel}
      className={`${BADGE_BASE} ${BADGE_DISABLED}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={109} height={40} loading="lazy" decoding="async" />
    </span>
  )
}
