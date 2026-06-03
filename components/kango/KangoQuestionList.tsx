import Link from "next/link"
import type { KangoQuestion } from "@/lib/kango/types"
import { examLabelFromId } from "@/lib/kango/exam"
import { tagToSlug } from "@/lib/tag-url"

/** カテゴリ/タグページの問題リスト。各行は本文抜粋 + 試験名 + タグ。タップでその問題から開始。 */
export function KangoQuestionList({ questions }: { questions: KangoQuestion[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {questions.map((q) => (
        <div key={q._id} className="kn-card" style={{ padding: 14 }}>
          <Link
            href={`/kango/play/${q.exam_id}?qid=${encodeURIComponent(q._id)}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span className="kn-chip">
                {examLabelFromId(q.exam_id)} 問{q.q_number}
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--color-kn-text-1)",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {q.body}
            </p>
          </Link>
          {q.tags && q.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {q.tags.map((t) => (
                <Link
                  key={t}
                  href={`/kango/tag/${tagToSlug(t)}`}
                  style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-kn-primary-text)", textDecoration: "none" }}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
