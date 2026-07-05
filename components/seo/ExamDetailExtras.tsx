import Link from "next/link"
import type { Question } from "@/lib/types"
import { tagToSlug } from "@/lib/tag-url"

export interface ExamDetailExtrasProps {
  intro: string
  questions: Question[]
  playBase: string
  /**
   * When set, 収録問題一覧 links go to this URL instead of `${playBase}/${q_number}`.
   * ip/fe/sg では canonical の /questions/ 解説ページへ張り、ハブからの内部リンクを
   * canonical 側へ集約する (play ページは canonical で解説ページを指す非 index 面)。
   */
  questionHref?: (question: Question) => string
  /** When undefined, tags render as plain chips instead of links (use when tag pages don't exist for this subject yet). */
  tagBase?: string
  parentLabel: string
  parentHref: string
  examLabel: string
  variant?: "default" | "denki"
}

function stripPlain(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/[#*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function ExamDetailExtras({
  intro,
  questions,
  playBase,
  questionHref,
  tagBase,
  parentLabel,
  parentHref,
  examLabel,
  variant = "default",
}: ExamDetailExtrasProps) {
  const tagCounts = new Map<string, number>()
  for (const q of questions) {
    for (const t of q.tags ?? []) {
      if (!t) continue
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const chipCls =
    variant === "denki"
      ? "flex items-center justify-between rounded-lg border border-[#d8d1bc] bg-[#fffdf6] px-3 py-1.5 text-[12px] hover:border-[#191815]"
      : "flex items-center justify-between rounded-lg border border-goukaku-divider bg-goukaku-surface/40 px-3 py-1.5 text-[12px] hover:bg-goukaku-surface"
  const plainChipCls =
    variant === "denki"
      ? "flex items-center justify-between rounded-lg border border-[#d8d1bc] bg-[#fffdf6] px-3 py-1.5 text-[12px]"
      : "flex items-center justify-between rounded-lg border border-goukaku-divider bg-goukaku-surface/40 px-3 py-1.5 text-[12px]"
  const questionCls =
    variant === "denki"
      ? "flex items-baseline gap-2 rounded-lg border border-transparent px-2 py-1 hover:border-[#d8d1bc] hover:bg-[#fffdf6]"
      : "flex items-baseline gap-2 rounded-md px-2 py-1 hover:bg-goukaku-surface/60"
  const relatedCls =
    variant === "denki"
      ? "block rounded-lg border border-[#d8d1bc] bg-[#fffdf6] px-3 py-2 hover:border-[#191815]"
      : "block rounded-lg border border-goukaku-divider bg-goukaku-surface/40 px-3 py-2 hover:bg-goukaku-surface"

  return (
    <section className="mt-8 space-y-7 text-[13px] leading-[1.85]">
      <div>
        <h2 className="text-[15px] font-extrabold mb-2.5 text-goukaku-ink/85">
          このページについて
        </h2>
        <p className="text-goukaku-ink/80">{intro}</p>
      </div>

      {topTags.length > 0 && (
        <div>
          <h2 className="text-[15px] font-extrabold mb-2.5 text-goukaku-ink/85">
            出題分野の内訳
          </h2>
          <p className="text-[11px] opacity-55 mb-2">
            タグ別の問題数(上位 {topTags.length} 件)
          </p>
          <ul className="grid grid-cols-2 gap-1.5">
            {topTags.map(([tag, count]) => {
              const chipInner = (
                <>
                  <span className="font-bold truncate">{tag}</span>
                  <span className="text-[11px] opacity-60 tabular-nums">
                    {count} 問
                  </span>
                </>
              )
              return (
                <li key={tag}>
                  {tagBase ? (
                    <Link
                      href={`${tagBase}/${tagToSlug(tag)}`}
                      className={chipCls}
                    >
                      {chipInner}
                    </Link>
                  ) : (
                    <span className={plainChipCls}>
                      {chipInner}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {questions.length > 0 && (
        <div>
          <h2 className="text-[15px] font-extrabold mb-2.5 text-goukaku-ink/85">
            収録問題一覧
          </h2>
          <p className="text-[11px] opacity-55 mb-2">
            全 {questions.length} 問。クリックで{questionHref ? "解説ページ" : "問題ページ"}へ
          </p>
          <ol className="space-y-1">
            {questions
              .slice()
              .sort((a, b) => a.q_number - b.q_number)
              .map((q) => {
                const preview = stripPlain(q.body).slice(0, 60)
                return (
                  <li key={q._id}>
                    <Link
                      href={questionHref ? questionHref(q) : `${playBase}/${q.q_number}`}
                      className={questionCls}
                    >
                      <span className="text-[11px] font-bold opacity-60 tabular-nums w-[2.5em] shrink-0">
                        問{q.q_number}
                      </span>
                      <span className="text-[12px] truncate">
                        {preview}
                        {preview.length === 60 ? "…" : ""}
                      </span>
                    </Link>
                  </li>
                )
              })}
          </ol>
        </div>
      )}

      <section>
        <h2 className="text-[15px] font-extrabold mb-2.5 text-goukaku-ink/85">
          関連ページ
        </h2>
        <ul className="grid grid-cols-2 gap-1.5 text-[12px]">
          <li>
            <Link
              href={`${parentHref}/guide`}
              className={relatedCls}
            >
              <span className="font-bold">📚 学習ガイド</span>
              <span className="block text-[11px] opacity-55 mt-0.5">
                試験概要・出題範囲・勉強法
              </span>
            </Link>
          </li>
          <li>
            <Link
              href={`${parentHref}/faq`}
              className={relatedCls}
            >
              <span className="font-bold">❓ FAQ</span>
              <span className="block text-[11px] opacity-55 mt-0.5">
                よくある質問
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <p className="text-[11px] opacity-60 pt-3 border-t border-goukaku-divider">
        ← <Link href={parentHref} className="underline">{parentLabel} のトップ</Link>へ戻る ({examLabel})
      </p>
    </section>
  )
}
