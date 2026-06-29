import Link from "next/link"
import type { Question } from "@/lib/types"

export interface RelatedQuestionsProps {
  current: { q_number: number; tags?: string[] }
  examQuestions: Question[]
  basePath: string
  examLabel: string
  examIdSlug?: string
  maxRelated?: number
  variant?: "default" | "denki"
}

export function RelatedQuestions({
  current,
  examQuestions,
  basePath,
  examLabel,
  maxRelated = 5,
  variant = "default",
}: RelatedQuestionsProps) {
  const currentTags = new Set(current.tags ?? [])

  const sameTagRelated = examQuestions
    .filter((q) => q.q_number !== current.q_number)
    .map((q) => {
      const overlap = (q.tags ?? []).filter((t) => currentTags.has(t)).length
      return { q, overlap }
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || a.q.q_number - b.q.q_number)
    .slice(0, maxRelated)
    .map((x) => x.q)

  const prevQ = examQuestions.find((q) => q.q_number === current.q_number - 1)
  const nextQ = examQuestions.find((q) => q.q_number === current.q_number + 1)

  if (sameTagRelated.length === 0 && !prevQ && !nextQ) return null

  const asideCls =
    variant === "denki"
      ? "mt-8 border-t-2 border-[#d8d1bc] pt-6"
      : "mt-8 border-t border-goukaku-divider pt-6"
  const navLinkCls =
    variant === "denki"
      ? "flex-1 rounded-lg border border-[#d8d1bc] bg-[#fffdf6] px-3 py-2 hover:border-[#191815]"
      : "flex-1 rounded-lg border border-goukaku-divider px-3 py-2 hover:bg-goukaku-surface"
  const cardCls =
    variant === "denki"
      ? "block rounded-lg border border-[#d8d1bc] bg-[#fffdf6] px-3 py-2 hover:border-[#191815]"
      : "block rounded-lg border border-goukaku-divider px-3 py-2 hover:bg-goukaku-surface"

  return (
    <aside className={asideCls}>
      <h2 className="text-[14px] font-extrabold mb-3 text-goukaku-ink/80">
        関連問題
      </h2>

      {(prevQ || nextQ) && (
        <nav
          aria-label="前後の問題"
          className="flex gap-2 mb-4 text-[12px]"
        >
          {prevQ && (
            <Link
              href={`${basePath}/${prevQ.q_number}`}
              className={navLinkCls}
            >
              ← 問{prevQ.q_number}
            </Link>
          )}
          {nextQ && (
            <Link
              href={`${basePath}/${nextQ.q_number}`}
              className={`${navLinkCls} text-right`}
            >
              問{nextQ.q_number} →
            </Link>
          )}
        </nav>
      )}

      {sameTagRelated.length > 0 && (
        <>
          <p className="text-[11px] opacity-60 mb-2">
            {examLabel} の同分野の問題
          </p>
          <ul className="space-y-1.5">
            {sameTagRelated.map((q) => {
              const preview = stripPlain(q.body).slice(0, 50)
              const sharedTag = (q.tags ?? []).find((t) => currentTags.has(t))
              return (
                <li key={q._id}>
                  <Link
                    href={`${basePath}/${q.q_number}`}
                    className={cardCls}
                  >
                    <span className="text-[11px] font-bold opacity-60">
                      問{q.q_number}
                      {sharedTag && (
                        <span className="ml-2 text-goukaku-pink-script">
                          {sharedTag}
                        </span>
                      )}
                    </span>
                    <span className="block text-[12px] mt-0.5 line-clamp-2">
                      {preview}
                      {preview.length === 50 ? "…" : ""}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </aside>
  )
}

function stripPlain(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/[#*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}
