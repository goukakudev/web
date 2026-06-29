import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
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

export default function CategoriesPage() {
  return (
    <MobileFrame>
      <JsonLd
        data={itemListJsonLd(
          CATEGORIES.filter((c) => c.status === "available").map((c) => ({
            name: c.label,
            url: `${SITE_URL}${c.href}`,
          })),
        )}
      />
      <header className="pt-6 pb-8">
        <div
          className="text-[28px] text-goukaku-pink-script leading-none"
          style={{ fontFamily: "var(--font-script)" }}
        >
          goukaku.dev
        </div>
        <div className="mt-3 inline-flex rounded-full border border-goukaku-divider bg-goukaku-surface px-3 py-1 text-[11px] font-bold text-goukaku-ink/65">
          IPA国家試験・国家資格の過去問演習
        </div>
        <h1
          className="mt-5 text-[30px] font-black leading-[1.22] tracking-[-0.04em]"
          aria-label="IPA国家試験・各種資格の過去問演習サイト 合格.dev"
        >
          <span className="block">IPA国家試験・各種資格の</span>
          <span className="block">過去問演習サイト 合格.dev</span>
        </h1>
        <p className="mt-4 text-[21px] font-black leading-[1.38] text-goukaku-ink/85">
          <span className="block">独学でも、合格できる。</span>
          <span className="block">合格から、人生を変えられる。</span>
        </p>
        <p className="text-[13px] opacity-70 mt-4 leading-relaxed">
          goukaku.dev は、IPA国家試験を中心に過去問・解説・用語リンク・模試を提供する学習サイトです。公式サイトではありません。
        </p>
      </header>

      <section className="grid grid-cols-1 gap-5">
        {CATEGORIES.map((c) => {
          const examKey = slugToExamKey(c.slug)
          const latest = examKey ? latestPassRate(examKey) : null
          const titleId = `exam-card-title-${c.slug}`
          const Inner = (
            <div
              className={`p-5 rounded-2xl border border-goukaku-divider bg-goukaku-surface flex items-center gap-4 ${
                c.status === "coming-soon" ? "opacity-65" : ""
              }`}
            >
              <div className="shrink-0" aria-hidden>
                <CategoryIcon name={c.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span id={titleId} className="text-[16px] font-extrabold truncate">{c.label}</span>
                  {c.status === "coming-soon" && (
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-goukaku-divider opacity-70">
                      準備中
                    </span>
                  )}
                </div>
                <div className="text-[11px] opacity-60 mt-0.5">{c.sub}</div>
                <div className="text-[12px] opacity-75 mt-2 leading-relaxed">
                  {c.description}
                </div>
                {latest && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-goukaku-cool/20 text-[11px] font-bold tabular-nums">
                    <PassRateIcon />
                    <span>{latest.displayYear} 合格率 {(latest.passRate * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div className="text-[14px] font-bold opacity-60">→</div>
            </div>
          )

          return (
            <div key={c.href}>
              {c.status === "available" ? (
                <div className="relative">
                  {Inner}
                  <Link
                    href={c.href}
                    aria-labelledby={titleId}
                    className="absolute inset-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-goukaku-pink-script focus-visible:ring-offset-2 focus-visible:ring-offset-goukaku-bg"
                  >
                    <span className="sr-only">{c.label}</span>
                  </Link>
                </div>
              ) : (
                Inner
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StoreBadge
                  testId={`store-ios-${c.slug}`}
                  src={APP_STORE_BADGE_SRC}
                  alt={`${c.label} を App Store でダウンロード`}
                  href={c.iosUrl}
                  unavailableLabel="App Store 準備中"
                />
              </div>
            </div>
          )
        })}
      </section>

      <section className="mt-12 space-y-6 text-[13px] leading-relaxed opacity-90">
        <div>
          <h2 className="text-[16px] font-extrabold mb-2">合格.dev とは</h2>
          <p>
            合格.dev（ごうかく / goukaku.dev）は、国家資格・検定試験の過去問を、解説とともに無料で演習できる学習プラットフォームです。
            会員登録なし・広告控えめ・スマホ操作に最適化された UI で、通勤通学のスキマ時間からの学習を後押しします。
            現在は <Link href="/fe" className="underline">基本情報技術者試験 (FE)</Link>、
            <Link href="/ip" className="underline">ITパスポート試験 (IP)</Link>、
            <Link href="/ap" className="underline">応用情報技術者試験 (AP)</Link>、
            <Link href="/sg" className="underline">情報セキュリティマネジメント試験 (SG)</Link>、
            <Link href="/sc" className="underline">情報処理安全確保支援士試験 (SC)</Link>、
            <Link href="/denki" className="underline">第二種電気工事士試験</Link>、
            <Link href="/takken" className="underline">宅地建物取引士試験 (宅建)</Link>、
            <Link href="/kango" className="underline">看護師国家試験</Link>
            の 8 試験に対応しており、順次他の資格にも拡張予定です。
          </p>
        </div>
        <div>
          <h2 className="text-[16px] font-extrabold mb-2">3 つの特徴</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <h3 className="m-0 inline text-[13px] font-bold">独自編集の解説</h3>:
              各設問に「全体解説」と「選択肢別解説」の二段構えで、なぜ正解か・他がなぜ違うかを言語化。引っかけパターンへの対応力を養えます。
            </li>
            <li>
              <h3 className="m-0 inline text-[13px] font-bold">3 つの学習モード</h3>:
              順番に解く / ランダムに解く / 本番形式の模試 (時間計測・採点付き) を試験ごとに切り替え可能。苦手分野の補強から仕上げまで一貫対応。
            </li>
            <li>
              <h3 className="m-0 inline text-[13px] font-bold">図表は再構築・ベクター化</h3>:
              元 PDF の図表は SVG で再描画し、Retina ディスプレイでも文字が滲みません。
              宅建では <Link href="/takken" className="underline">関連条文・判例タップでポップアップ表示</Link>。
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-[16px] font-extrabold mb-2">対応試験一覧</h2>
          <ul className="space-y-1.5 text-[12px]">
            <li>
              <h3 className="m-0 inline text-[12px] font-normal"><Link href="/fe" className="underline">基本情報技術者試験</Link></h3>
              {" — "}
              平成 25 年 (2013) 〜 令和 7 年 (2025) ・ 全 800 問以上 ・ 模試 90 分
            </li>
            <li>
              <h3 className="m-0 inline text-[12px] font-normal"><Link href="/ip" className="underline">ITパスポート試験</Link></h3>
              {" — "}
              29 回分 ・ 全 2,700 問 ・ ストラテジ / マネジメント / テクノロジの 3 分野
            </li>
            <li>
              <h3 className="m-0 inline text-[12px] font-normal"><Link href="/ap" className="underline">応用情報技術者試験</Link></h3>
              {" — "}
              平成 28 年 (2016) 〜 令和 7 年 (2025) ・ 午前 18 回分 ・ 全 1,440 問 ・ 模試 150 分
            </li>
            <li>
              <h3 className="m-0 inline text-[12px] font-normal"><Link href="/sg" className="underline">情報セキュリティマネジメント試験</Link></h3>
              {" — "}
              平成 28 年 (2016) 〜 令和 7 年 (2025) ・ 科目A 公開過去問 ・ 模試 90 分
            </li>
            <li>
              <h3 className="m-0 inline text-[12px] font-normal"><Link href="/sc" className="underline">情報処理安全確保支援士試験</Link></h3>
              {" — "}
              レベル 4 (高度試験) ・ 国家資格『登録セキスペ』 ・ 午前 II 公開過去問を収録 ・ 模試 40 分
            </li>
            <li>
              <h3 className="m-0 inline text-[12px] font-normal"><Link href="/denki" className="underline">第二種電気工事士試験</Link></h3>
              {" — "}
              平成 21 年 (2009) 〜 令和 8 年 (2026) ・ 学科試験 39 回分 ・ 全 1,950 問 ・ 模試 120 分
            </li>
            <li>
              <h3 className="m-0 inline text-[12px] font-normal"><Link href="/takken" className="underline">宅地建物取引士試験</Link></h3>
              {" — "}
              H16 (2004) 〜 R7 (2025) ・ 全 24 試験 ・ 約 1,200 問 ・ 4 分野
            </li>
            <li>
              <h3 className="m-0 inline text-[12px] font-normal"><Link href="/kango" className="underline">看護師国家試験</Link></h3>
              {" — "}
              第 115 回ほか ・ 看護師 / 保健師 / 助産師 ・ 選択肢別解説付き
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-[16px] font-extrabold mb-2">よくある質問</h2>
          <dl className="space-y-3 text-[12px]">
            <div>
              <dt className="font-bold">完全無料ですか？</dt>
              <dd className="opacity-80 mt-0.5">はい。会員登録もありません。広告は最小限に抑えて運営しています。</dd>
            </div>
            <div>
              <dt className="font-bold">解説の信頼性は？</dt>
              <dd className="opacity-80 mt-0.5">問題文は各実施団体の公開過去問に基づき、解説は本サイト独自の要約です。公式見解ではないため、最終的な解釈は公式資料でご確認ください。</dd>
            </div>
            <div>
              <dt className="font-bold">スマホでも使えますか？</dt>
              <dd className="opacity-80 mt-0.5">主にスマホ縦画面向けに UI 設計しています。PC でも快適に動作します。</dd>
            </div>
          </dl>
        </div>
      </section>
      <footer className="mt-12 text-[11px] opacity-50 leading-relaxed">
        <p>
          掲載している試験問題は、各実施団体が公開する過去問題を利用しています。解説文は本サイト独自の要約であり、公式見解を示すものではありません。
        </p>
      </footer>
    </MobileFrame>
  )
}

function CategoryIcon({ name }: { name: CategoryIconName }) {
  return (
    <span className="inline-grid size-12 place-items-center rounded-2xl border border-goukaku-divider bg-goukaku-ink/5 text-goukaku-ink">
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
