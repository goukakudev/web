import Link from "next/link"
import type { Question } from "@/lib/types"
import { tagToSlug } from "@/lib/tag-url"

export interface ExamDetailExtrasProps {
  intro: string
  questions: Question[]
  playBase: string
  /** When undefined, tags render as plain chips instead of links (use when tag pages don't exist for this subject yet). */
  tagBase?: string
  parentLabel: string
  parentHref: string
  examLabel: string
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
  tagBase,
  parentLabel,
  parentHref,
  examLabel,
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
                      className="flex items-center justify-between rounded-lg border border-goukaku-divider bg-goukaku-surface/40 px-3 py-1.5 text-[12px] hover:bg-goukaku-surface"
                    >
                      {chipInner}
                    </Link>
                  ) : (
                    <span className="flex items-center justify-between rounded-lg border border-goukaku-divider bg-goukaku-surface/40 px-3 py-1.5 text-[12px]">
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
            全 {questions.length} 問。クリックで問題ページへ
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
                      href={`${playBase}/${q.q_number}`}
                      className="flex items-baseline gap-2 rounded-md px-2 py-1 hover:bg-goukaku-surface/60"
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

      <p className="text-[11px] opacity-60 pt-3 border-t border-goukaku-divider">
        ← <Link href={parentHref} className="underline">{parentLabel} のトップ</Link>へ戻る ({examLabel})
      </p>
    </section>
  )
}
