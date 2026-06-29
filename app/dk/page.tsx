import type { Metadata } from "next"
import Link from "next/link"
import { listDkExams } from "@/lib/api-client"
import { makeMetadata } from "@/lib/seo/metadata"
import { itemListJsonLd, courseJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { tagToSlug } from "@/lib/tag-url"
import type { ExamSummary } from "@/lib/types"

const APP_STORE_URL =
  "https://apps.apple.com/jp/app/第二種電気工事士-過去問演/id6782514809"

const FOCUS_AREAS = [
  { label: "配線図", tag: "#配線図" },
  { label: "図記号", tag: "#図記号" },
  { label: "機器・材料・工具", tag: "#機器・材料・工具" },
  { label: "配線器具", tag: "#配線器具" },
  { label: "電気理論", tag: "#電気理論" },
  { label: "施工方法", tag: "#施工方法" },
  { label: "配電・設計", tag: "#配電・設計" },
  { label: "検査方法", tag: "#検査方法" },
  { label: "法令", tag: "#法令" },
  { label: "工具", tag: "#工具" },
]

export const metadata: Metadata = makeMetadata({
  title: "第二種電気工事士 学科試験 過去問 + 解説",
  description:
    "第二種電気工事士の学科試験過去問を無料で。図入り問題を含む39回分・1,950問を、順番に / ランダムに / 模試形式で解けます。全問解説・選択肢ごとの解説・ヒント付き。",
  path: "/dk",
})

export default async function DkHomePage() {
  const exams = await listDkExams()
  const latest = exams[0]
  const totalQuestions = exams.reduce((sum, exam) => sum + (exam.question_count ?? 0), 0)
  const latestLabel = latest ? examLabel(latest) : "最新回"

  return (
    <main className="min-h-screen bg-[#f5f2e8] text-[#191815]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <JsonLd
          data={itemListJsonLd(
            exams.map((e) => ({
              name: `${examLabel(e)} 過去問`,
              url: `${SITE_URL}/dk/exam/${e.exam_id}`,
            })),
          )}
        />
        <JsonLd
          data={courseJsonLd({
            name: "第二種電気工事士 学科試験 過去問学習コース",
            description:
              "第二種電気工事士の学科試験過去問を解説・ヒント付きで無料演習。電気理論・配電設計・配線図・施工方法・検査・法令の分野別学習に対応。",
            url: `${SITE_URL}/dk`,
            aboutName: "第二種電気工事士 学科試験",
            examYears: "平成21年(2009)〜令和8年(2026)",
            totalQuestions,
            credentialName: "第二種電気工事士",
          })}
        />

        <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#d8d1bc] pb-4">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-[14px] font-black">
            <span className="grid size-9 place-items-center rounded-lg border-2 border-[#191815] bg-[#ffe25a] shadow-[3px_3px_0_#191815]">
              ⚡
            </span>
            <span>goukaku.dev</span>
          </Link>
          <nav aria-label="第二種電気工事士メニュー" className="flex flex-wrap gap-2">
            <Link href="/dk/guide" className="rounded-lg border border-[#191815]/20 bg-white px-3 py-2 text-[12px] font-extrabold">
              ガイド
            </Link>
            <Link href="/dk/faq" className="rounded-lg border border-[#191815]/20 bg-white px-3 py-2 text-[12px] font-extrabold">
              FAQ
            </Link>
            <Link href="/dk/bookmarks" className="rounded-lg border border-[#191815]/20 bg-white px-3 py-2 text-[12px] font-extrabold">
              ブックマーク
            </Link>
            <Link href="/dk/history" className="rounded-lg border border-[#191815]/20 bg-white px-3 py-2 text-[12px] font-extrabold">
              履歴
            </Link>
          </nav>
        </header>

        <section className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
          <div className="rounded-lg border-2 border-[#191815] bg-[#fffdf6] p-5 shadow-[6px_6px_0_#191815] sm:p-7">
            <p className="text-[12px] font-black tracking-[0.18em] text-[#007c83]">
              SECOND-CLASS ELECTRICIAN
            </p>
            <h1 className="mt-3 max-w-2xl text-[34px] font-black leading-[1.08] tracking-normal sm:text-[48px]">
              第二種電気工事士
              <span className="block">過去問演</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] font-medium leading-relaxed text-[#4d473a] sm:text-[15px]">
              学科試験の公開過去問を、図入り問題・選択肢別解説・ヒント付きで演習できます。
              計算、配線図、工具、施工方法、検査、法令まで本番形式で確認できます。
            </p>

            <div className="mt-6 grid grid-cols-3 divide-x divide-[#d8d1bc] border-y border-[#d8d1bc] py-4">
              <Metric label="試験回" value={String(exams.length)} />
              <Metric label="問題数" value={totalQuestions.toLocaleString("ja-JP")} />
              <Metric label="模試" value="120分" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {latest ? (
                <Link
                  href={`/dk/play/${latest.exam_id}/q/1`}
                  className="flex min-h-[64px] items-center justify-center rounded-lg border-2 border-[#191815] bg-[#ffe25a] px-4 text-center text-[14px] font-black shadow-[3px_3px_0_#191815] transition hover:-translate-y-0.5"
                >
                  最新回を順番に解く
                </Link>
              ) : (
                <span className="flex min-h-[64px] items-center justify-center rounded-lg border-2 border-[#191815]/30 bg-[#e5dfcf] px-4 text-center text-[14px] font-black text-[#191815]/50">
                  準備中
                </span>
              )}
              <Link
                href="/dk/play/random"
                className="flex min-h-[64px] items-center justify-center rounded-lg border-2 border-[#191815] bg-[#b8f3f2] px-4 text-center text-[14px] font-black shadow-[3px_3px_0_#191815] transition hover:-translate-y-0.5"
              >
                ランダム20問
              </Link>
              {latest ? (
                <Link
                  href={`/dk/play/${latest.exam_id}?mode=exam`}
                  className="flex min-h-[64px] items-center justify-center rounded-lg border-2 border-[#191815] bg-white px-4 text-center text-[14px] font-black shadow-[3px_3px_0_#191815] transition hover:-translate-y-0.5"
                >
                  模試で解く
                </Link>
              ) : (
                <span className="flex min-h-[64px] items-center justify-center rounded-lg border-2 border-[#191815]/30 bg-[#e5dfcf] px-4 text-center text-[14px] font-black text-[#191815]/50">
                  準備中
                </span>
              )}
            </div>
          </div>

          <aside className="rounded-lg border-2 border-[#191815] bg-[#191815] p-5 text-white shadow-[6px_6px_0_#ffe25a]">
            <p className="text-[11px] font-black tracking-[0.18em] text-[#ffe25a]">CONTROL BOARD</p>
            <div className="mt-5 space-y-5">
              <ControlRow label="最新収録" value={latestLabel} />
              <ControlRow label="問題形式" value="四肢択一 / 図入り" />
              <ControlRow label="本番時間" value="120分" />
            </div>
            <div className="mt-6 rounded-lg border border-white/15 bg-white/5 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[11px] font-black tracking-[0.12em] text-[#ffe25a]">
                  本番ペース目安
                </p>
                <p className="text-[12px] font-black text-white/70">50問 / 120分</p>
              </div>
              <div className="mt-3 grid gap-2 text-[12px] font-bold text-white/70">
                <div className="flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-2">
                  <span>1問あたり</span>
                  <span className="text-[14px] font-black text-white">約2分24秒</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-2">
                  <span>見直し時間</span>
                  <span className="text-[14px] font-black text-white">10分確保</span>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-2">
              {latest ? (
                <ControlLink
                  href={`/dk/play/${latest.exam_id}/q/1`}
                  label="最新回から開始"
                  detail="直近の試験を1問目から"
                  emphasized
                />
              ) : null}
              <ControlLink
                href="/dk/play/random"
                label="ランダム20問"
                detail="全年度から横断演習"
              />
              <ControlLink
                href="/dk/guide"
                label="進め方を見る"
                detail="計算・配線図・暗記分野を整理"
              />
            </div>
            <Link
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex min-h-[54px] items-center justify-center rounded-lg border border-white/20 bg-white px-4"
              aria-label="第二種電気工事士 過去問演をApp Storeで開く"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/app-store-badge-ja.svg" alt="App Storeでダウンロード" width={109} height={40} />
            </Link>
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-[#d8d1bc] bg-white p-5">
            <h2 className="text-[18px] font-black">学習メニュー</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <MenuLink href="#dk-exams" label="年度別" detail="公開回ごとに50問演習" />
              <MenuLink href="/dk/play/random" label="横断ランダム" detail="全試験から20問抽出" />
              <MenuLink href="/dk/guide" label="学習ガイド" detail="計算・配線図・暗記分野の整理" />
            </div>
          </div>

          <div className="rounded-lg border border-[#d8d1bc] bg-white p-5">
            <h2 className="text-[18px] font-black">分野から探す</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {FOCUS_AREAS.map((area) => (
                <Link
                  key={area.tag}
                  href={`/dk/tag/${tagToSlug(area.tag)}`}
                  className="min-h-10 rounded-lg border border-[#191815]/15 bg-[#f5f2e8] px-3 py-2 text-[13px] font-extrabold transition hover:border-[#007c83] hover:bg-[#b8f3f2]"
                >
                  {area.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="dk-exams" className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[0.18em] text-[#007c83]">EXAM ARCHIVE</p>
              <h2 className="mt-1 text-[24px] font-black">収録試験回</h2>
            </div>
            {latest ? (
              <Link href={`/dk/exam/${latest.exam_id}`} className="rounded-lg border border-[#191815]/20 bg-white px-3 py-2 text-[12px] font-extrabold">
                {latestLabel}を見る
              </Link>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Link
                key={exam.exam_id}
                href={`/dk/exam/${exam.exam_id}`}
                className="group min-h-[122px] rounded-lg border border-[#d8d1bc] bg-[#fffdf6] p-4 transition hover:-translate-y-0.5 hover:border-[#191815] hover:shadow-[4px_4px_0_#191815]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[12px] font-black tracking-[0.12em] text-[#6c6252]">
                    {examYearLabel(exam)}
                  </span>
                  <span className="text-[12px] font-black text-[#007c83]">全{exam.question_count}問</span>
                </div>
                <h3 className="mt-4 text-[15px] font-black leading-snug">{examLabel(exam)}</h3>
                <p className="mt-2 text-[12px] font-medium text-[#6c6252]">
                  順番 / ランダム / 模試
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 max-w-3xl text-[13px] leading-[1.85] text-[#4d473a]">
          <h2 className="text-[18px] font-black text-[#191815]">第二種電気工事士の過去問演習について</h2>
          <p className="mt-3">
            合格.dev の第二種電気工事士ページは、一般財団法人電気技術者試験センターが公開する学科試験の過去問題に基づき、問題演習・解説・分野タグをまとめた学習ページです。
            問題文・選択肢・正解番号は公開資料に基づき、解説・ヒント・タグ付け・学習ガイドは合格.dev 編集部が独自に作成しています。
          </p>
          <p className="mt-3">
            図入り問題は、問題本文と図版を見ながら解答できます。配線図・器具鑑別・施工条件の読み取りは、年度別の通し演習と分野別の復習を行き来して確認できます。
          </p>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}

function examLabel(exam: ExamSummary): string {
  const label = exam.title ?? [exam.year, exam.section].filter(Boolean).join(" ")
  return label || exam.exam_id
}

function examYearLabel(exam: ExamSummary): string {
  const match = exam.exam_id.match(/\d{4}/)
  return match?.[0] ?? exam.year
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <div className="text-[11px] font-black tracking-[0.12em] text-[#6c6252]">{label}</div>
      <div className="mt-1 text-[22px] font-black tabular-nums">{value}</div>
    </div>
  )
}

function ControlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/15 pb-4">
      <div className="text-[11px] font-black tracking-[0.12em] text-white/50">{label}</div>
      <div className="mt-1 text-[15px] font-black">{value}</div>
    </div>
  )
}

function ControlLink({
  href,
  label,
  detail,
  emphasized = false,
}: {
  href: string
  label: string
  detail: string
  emphasized?: boolean
}) {
  return (
    <Link
      href={href}
      className={[
        "flex min-h-[58px] items-center justify-between gap-3 rounded-lg border px-4 py-3 transition hover:-translate-y-0.5",
        emphasized
          ? "border-[#ffe25a] bg-[#ffe25a] text-[#191815]"
          : "border-white/15 bg-white/10 text-white hover:border-white/35",
      ].join(" ")}
    >
      <span>
        <span className="block text-[13px] font-black">{label}</span>
        <span
          className={[
            "mt-0.5 block text-[11px] font-bold",
            emphasized ? "text-[#191815]/70" : "text-white/60",
          ].join(" ")}
        >
          {detail}
        </span>
      </span>
      <span className="text-[16px] font-black" aria-hidden>
        →
      </span>
    </Link>
  )
}

function MenuLink({
  href,
  label,
  detail,
}: {
  href: string
  label: string
  detail: string
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[74px] items-center justify-between gap-4 rounded-lg border border-[#191815]/15 bg-[#f5f2e8] px-4 py-3 transition hover:border-[#191815]"
    >
      <span>
        <span className="block text-[14px] font-black">{label}</span>
        <span className="mt-0.5 block text-[12px] font-medium text-[#6c6252]">{detail}</span>
      </span>
      <span className="text-[18px] font-black" aria-hidden>
        →
      </span>
    </Link>
  )
}
