import type { Metadata } from "next"
import Link from "next/link"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { JsonLd } from "@/components/seo/JsonLd"
import { ProLeadForm } from "@/components/pro/ProLeadForm"
import { makeMetadata } from "@/lib/seo/metadata"
import { SITE_URL, webPageJsonLd } from "@/lib/seo/structured-data"

export const metadata: Metadata = makeMetadata({
  title: "合格.dev Pro — 弱点分析と復習サポート",
  description:
    "合格.dev Proの予定機能。広告なし、弱点分析、間違いノート、復習リマインダー、模試履歴保存、PDF要点シートなど、学習を継続するための導線。",
  path: "/pro",
})

const FEATURES = [
  ["広告なしPro", "解説ページと演習画面を、学習に集中しやすい表示で使える予定です。"],
  ["弱点分析", "回答履歴から、分野・タグ別に落としているテーマを確認できるようにします。"],
  ["間違いノート", "間違えた問題と解説を自動でまとめ、直前復習に戻れる導線を作ります。"],
  ["復習リマインダー", "忘れやすい問題を、日を空けて再演習できるようにします。"],
  ["模試履歴保存", "模試ごとの正答数、所要時間、分野別の穴を見返せるようにします。"],
  ["PDF要点シート", "頻出用語・直前チェックを持ち運べる形で提供する予定です。"],
]

export default function ProPage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "Pro", href: "/pro" },
      ]} />
      <JsonLd
        data={webPageJsonLd({
          name: "合格.dev Pro",
          description:
            "弱点分析、間違いノート、復習リマインダー、模試履歴保存など、資格学習を継続するためのPro機能。",
          url: `${SITE_URL}/pro`,
        })}
      />

      <header>
        <p className="text-[11px] font-bold tracking-[1.2px] text-goukaku-ink/50 uppercase">
          Pro
        </p>
        <h1 className="mt-1 text-[22px] font-extrabold leading-[1.45]">
          弱点を見つけて、復習に戻る
        </h1>
        <p className="mt-3 text-[13px] leading-[1.85] text-goukaku-ink/72">
          合格.dev Pro は、過去問を解いたあとに「何を復習すべきか」を迷わないための学習サポートとして準備しています。現時点では決済機能は提供していません。
        </p>
      </header>

      <section className="mt-7 grid grid-cols-1 gap-3">
        {FEATURES.map(([title, body]) => (
          <div key={title} className="rounded-xl border border-goukaku-divider bg-goukaku-surface/45 p-4">
            <h2 className="text-[15px] font-extrabold">{title}</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-goukaku-ink/68">
              {body}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-goukaku-divider bg-goukaku-lime/25 p-4">
        <h2 className="text-[15px] font-extrabold">まずは無料で始める</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-goukaku-ink/70">
          Pro提供前でも、過去問・解説・模試・用語リンクは無料で使えます。アプリ版はスワイプ操作で復習しやすく、今後のPro導線とも接続していく予定です。
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2">
          <Link
            href="/ip"
            className="inline-flex items-center justify-center rounded-lg bg-goukaku-ink-fixed px-4 py-3 text-[13px] font-extrabold text-goukaku-lime"
            data-analytics-event="pro_signup_click"
            data-analytics-props={JSON.stringify({ source: "pro_page", intent: "start_ip" })}
          >
            ITパスポートを無料で始める
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg border border-goukaku-divider bg-white/45 px-4 py-3 text-[13px] font-extrabold text-goukaku-ink/80"
            data-analytics-event="pro_signup_click"
            data-analytics-props={JSON.stringify({ source: "pro_page", intent: "contact" })}
          >
            法人・学校利用を相談する
          </Link>
        </div>
      </section>

      <ProLeadForm />
    </MobileFrame>
  )
}
