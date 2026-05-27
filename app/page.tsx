import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { latestPassRate, type ExamKey } from "@/lib/pass-rates"
import { makeMetadata } from "@/lib/seo/metadata"
import { itemListJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"

export const metadata: Metadata = makeMetadata({
  title: "合格.dev — 資格の過去問学習サイト",
  description:
    "独学でも合格できる。合格から、人生を変えられる。goukaku.dev は資格に挑むすべての人へ、過去問・解説・ヒントを届ける学習プラットフォームです。",
  path: "/",
})

type Category = {
  slug: string
  href: string
  label: string
  sub: string
  description: string
  emoji: string
  status: "available" | "coming-soon"
  iosUrl?: string
  androidUrl?: string
}

const CATEGORIES: Category[] = [
  {
    slug: "ip",
    href: "/ip",
    label: "ITパスポート試験",
    sub: "IT Passport Exam",
    description:
      "29 年分・各 100 問・全 2,900 問の過去問。解説・ヒント・選択肢ごとの正誤付き",
    emoji: "📘",
    status: "available",
  },
  {
    slug: "fe",
    href: "/fe",
    label: "基本情報技術者試験",
    sub: "Fundamental IT Engineer",
    description:
      "13 年分・各 80 問前後の過去問。順番 / ランダム / 模試で解けます",
    emoji: "💻",
    status: "available",
    iosUrl: "https://apps.apple.com/jp/app/基本情報技術者-過去問/id6770801070",
  },
  {
    slug: "takken",
    href: "/takken",
    label: "宅地建物取引士",
    sub: "Real Estate Transaction Agent",
    description: "宅建の過去問。関連条文・判例タップで本文ポップアップ表示",
    emoji: "🏠",
    status: "available",
  },
]

const APP_STORE_BADGE_SRC =
  "https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/ja-jp?releaseDate=1746489600"
const GOOGLE_PLAY_BADGE_SRC =
  "https://play.google.com/intl/ja/badges/static/images/badges/ja_badge_web_generic.png"

function slugToExamKey(slug: string): ExamKey | null {
  switch (slug) {
    case "fe": return "fe"
    case "ip": return "ip"
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
          資格に挑むすべての人へ
        </div>
        <h1
          className="mt-5 text-[30px] font-black leading-[1.22] tracking-[-0.04em]"
          aria-label="独学でも、合格できる。合格から、人生を変えられる。"
        >
          <span className="block">独学でも、合格できる。</span>
          <span className="block">合格から、人生を変えられる。</span>
        </h1>
        <p className="text-[13px] opacity-70 mt-4 leading-relaxed">
          goukaku.dev は、資格に挑むすべての人へ、過去問・解説・ヒントを届ける学習プラットフォームです。
        </p>
      </header>

      <section className="grid grid-cols-1 gap-5">
        {CATEGORIES.map((c) => {
          const examKey = slugToExamKey(c.slug)
          const latest = examKey ? latestPassRate(examKey) : null
          const Inner = (
            <div
              className={`p-5 rounded-2xl border border-goukaku-divider bg-goukaku-surface flex items-center gap-4 ${
                c.status === "coming-soon" ? "opacity-65" : ""
              }`}
            >
              <div className="text-[34px] leading-none" aria-hidden>
                {c.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <div className="text-[16px] font-extrabold truncate">{c.label}</div>
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
                    <span aria-hidden>🏆</span>
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
                <Link href={c.href} className="block">
                  {Inner}
                </Link>
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
                <StoreBadge
                  testId={`store-android-${c.slug}`}
                  src={GOOGLE_PLAY_BADGE_SRC}
                  alt={`${c.label} を Google Play で取得`}
                  href={c.androidUrl}
                  unavailableLabel="Google Play 準備中"
                />
              </div>
            </div>
          )
        })}
      </section>

      <footer className="mt-12 text-[11px] opacity-50 leading-relaxed">
        <p>
          掲載している試験問題は、各実施団体が公開する過去問題を利用しています。解説文は本サイト独自の要約であり、公式見解を示すものではありません。
        </p>
      </footer>
    </MobileFrame>
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
        <img src={src} alt={alt} height={40} style={{ height: 40, width: "auto" }} loading="lazy" />
      </a>
    )
  }

  return (
    <span
      data-testid={testId}
      role="img"
      aria-disabled="true"
      aria-label={`${alt} (${unavailableLabel})`}
      title={unavailableLabel}
      className={`${BADGE_BASE} ${BADGE_DISABLED}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" height={40} style={{ height: 40, width: "auto" }} loading="lazy" />
    </span>
  )
}
