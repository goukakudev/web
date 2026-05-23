import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"

export const metadata = {
  title: "合格.dev — 資格の過去問学習サイト",
  description:
    "基本情報技術者試験・宅地建物取引士など、各種資格の過去問を無料で。解説・選択肢別解説・模試モード付き。",
  alternates: { canonical: "/" },
}

type Category = {
  href: string
  label: string
  sub: string
  description: string
  emoji: string
  status: "available" | "coming-soon"
}

const CATEGORIES: Category[] = [
  {
    href: "/ip",
    label: "ITパスポート試験",
    sub: "IT Passport Exam",
    description: "29 年分・各 100 問・全 2,900 問の過去問。解説・ヒント・選択肢ごとの正誤付き",
    emoji: "📘",
    status: "available",
  },
  {
    href: "/fe",
    label: "基本情報技術者試験",
    sub: "Fundamental IT Engineer",
    description: "13 年分・各 80 問前後の過去問。順番 / ランダム / 模試で解けます",
    emoji: "💻",
    status: "available",
  },
  {
    href: "/takken",
    label: "宅地建物取引士",
    sub: "Real Estate Transaction Agent",
    description: "宅建の過去問。関連条文・判例タップで本文ポップアップ表示",
    emoji: "🏠",
    status: "available",
  },
]

export default function CategoriesPage() {
  return (
    <MobileFrame>
      <header className="pt-6 pb-8">
        <div
          className="text-[28px] text-goukaku-pink-script leading-none"
          style={{ fontFamily: "var(--font-script)" }}
        >
          goukaku.dev
        </div>
        <h1 className="text-[22px] font-extrabold mt-2">合格.dev</h1>
        <p className="text-[13px] opacity-65 mt-2 leading-relaxed">
          各種資格の過去問を無料で。学習カテゴリを選んでください。
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3">
        {CATEGORIES.map((c) => {
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
              </div>
              <div className="text-[14px] font-bold opacity-60">→</div>
            </div>
          )
          return c.status === "available" ? (
            <Link key={c.href} href={c.href} className="block">
              {Inner}
            </Link>
          ) : (
            <div key={c.href}>{Inner}</div>
          )
        })}
      </section>

      <footer className="mt-12 text-[11px] opacity-50 leading-relaxed">
        <p>
          掲載している試験問題は、各実施団体が公開する過去問題を利用しています。解説文は本サイト独自の要約であり、公式見解を示すものではありません。
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/about" className="underline">
            about
          </Link>
          <Link href="/privacy" className="underline">
            privacy
          </Link>
          <Link href="/terms" className="underline">
            terms
          </Link>
          <Link href="/contact" className="underline">
            contact
          </Link>
          <Link href="/support" className="underline">
            support
          </Link>
        </div>
      </footer>
    </MobileFrame>
  )
}
