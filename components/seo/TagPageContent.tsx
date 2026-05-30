import Link from "next/link"
import { TagQuestionRow } from "@/components/tag/TagQuestionRow"
import type { ExamSummary, PopularTag, Question } from "@/lib/types"
import { tagToSlug } from "@/lib/tag-url"
import { JsonLd } from "@/components/seo/JsonLd"
import {
  collectionPageJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"

export interface TagPageContentProps {
  display: string
  slug: string
  intro: string
  questions: Question[]
  examsById: Map<string, ExamSummary>
  relatedTags: PopularTag[]
  /** "fe" | "ip" | "ap" — passed to TagQuestionRow so it routes to the correct play page. */
  subject: "fe" | "ip" | "ap"
  /** Base path for tag pages, e.g. "/fe/tag" — used for related-tag links. */
  tagBase: string
  /** Base path for play pages, e.g. "/fe/play" — used for question links. */
  playBase: string
  /** Base path for exam detail pages, e.g. "/fe/exam" — used for "year coverage" links. */
  examBase: string
  /** Full label e.g. "基本情報技術者試験" — for description text. */
  subjectFullName: string
}

export function TagPageContent({
  display,
  slug,
  intro,
  questions,
  examsById,
  relatedTags,
  subject,
  tagBase,
  playBase,
  examBase,
  subjectFullName,
}: TagPageContentProps) {
  const examYearSet = new Set<string>()
  for (const q of questions) examYearSet.add(q.exam_id)
  const examYears = [...examYearSet]
    .map((eid) => examsById.get(eid))
    .filter((e): e is ExamSummary => Boolean(e))
    .sort((a, b) => (a.exam_id < b.exam_id ? 1 : -1))

  const collectionItems = questions.map((q) => ({
    name: `${examsById.get(q.exam_id)?.title ?? q.exam_id} 問${q.q_number}`,
    url: `${SITE_URL}${playBase}/${q.exam_id}/q/${q.q_number}`,
  }))

  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: `#${display} の${subjectFullName}過去問`,
          description: `${subjectFullName}の過去問のうち「${display}」タグが付いた ${questions.length} 問の一覧`,
          url: `${SITE_URL}${tagBase}/${slug}`,
          items: collectionItems.slice(0, 100),
        })}
      />
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center bg-goukaku-cool/35 text-[#1a8acb] text-[13px] font-extrabold px-2.5 py-1.5 rounded-xl">
          #{display}
        </span>
        <span className="text-[12px] font-extrabold text-goukaku-ink/55">
          {questions.length} 問
        </span>
      </div>

      <h1 className="sr-only">
        {subjectFullName} のタグ「{display}」過去問 {questions.length} 問
      </h1>

      <p className="text-[12px] leading-[1.85] text-goukaku-ink/75 mb-5">
        {intro}
      </p>

      {questions.length === 0 ? (
        <p className="text-[13px] text-goukaku-ink/55 mt-6 text-center">
          該当する問題がありません
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            {questions.map((q) => (
              <TagQuestionRow
                key={q._id}
                question={q}
                exam={examsById.get(q.exam_id)}
                subject={subject}
              />
            ))}
          </div>

          {relatedTags.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
                関連タグ
              </h2>
              <p className="text-[11px] opacity-55 mb-2">
                「{display}」と同じ問題に付いている頻度が高いタグ
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {relatedTags.map((t) => (
                  <li key={t.tag}>
                    <Link
                      href={`${tagBase}/${tagToSlug(t.tag)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-goukaku-divider bg-goukaku-surface/40 px-2.5 py-1 text-[12px] hover:bg-goukaku-surface"
                    >
                      <span className="font-bold">{t.tag}</span>
                      <span className="text-[10px] opacity-60 tabular-nums">
                        {t.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {examYears.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
                収録試験年度
              </h2>
              <p className="text-[11px] opacity-55 mb-2">
                「{display}」の問題がある年度の試験詳細
              </p>
              <ul className="grid grid-cols-2 gap-1.5">
                {examYears.map((exam) => (
                  <li key={exam.exam_id}>
                    <Link
                      href={`${examBase}/${exam.exam_id}`}
                      className="block rounded-lg border border-goukaku-divider bg-goukaku-surface/40 px-3 py-2 text-[12px] hover:bg-goukaku-surface"
                    >
                      <span className="font-bold truncate block">
                        {exam.title ?? exam.exam_id}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  )
}
