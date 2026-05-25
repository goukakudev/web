import Link from "next/link"
import type { PopularTag, Question, ExamSummary } from "@/lib/types"
import { tagToSlug } from "@/lib/tag-url"
import { JsonLd } from "@/components/seo/JsonLd"
import {
  collectionPageJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"
import type { CategoryMeta } from "@/lib/seo/category-meta/fe"

export interface CategoryPageContentProps {
  meta: CategoryMeta
  matchedTags: PopularTag[]
  sampleQuestions: { q: Question; exam: ExamSummary | undefined }[]
  totalMatched: number
  subjectFullName: string
  tagBase: string
  playBase: string
  path: string
}

function stripPlain(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/[#*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function CategoryPageContent({
  meta,
  matchedTags,
  sampleQuestions,
  totalMatched,
  subjectFullName,
  tagBase,
  playBase,
  path,
}: CategoryPageContentProps) {
  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: `${meta.name} の${subjectFullName}過去問`,
          description: `${subjectFullName} ${meta.name} 分野 の過去問・タグ・関連分野まとめ`,
          url: `${SITE_URL}${path}`,
          items: matchedTags.map((t) => ({
            name: `${t.tag} (${t.count} 問)`,
            url: `${SITE_URL}${tagBase}/${tagToSlug(t.tag)}`,
          })),
        })}
      />

      <p className="text-[11px] tracking-[1.2px] text-goukaku-ink/55 uppercase mb-1">
        {meta.shortName}
      </p>
      <h1 className="text-[22px] font-extrabold mb-3 leading-[1.4]">
        {subjectFullName} {meta.name}
      </h1>
      <p className="text-[13px] leading-[1.85] text-goukaku-ink/85 mb-7">
        {meta.description}
      </p>

      {matchedTags.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[15px] font-extrabold mb-2 text-goukaku-ink/85">
            この分野のタグ
          </h2>
          <p className="text-[11px] opacity-55 mb-2">
            {meta.name}に含まれるタグ {matchedTags.length} 件・合計 {totalMatched} 問
          </p>
          <ul className="grid grid-cols-2 gap-1.5">
            {matchedTags.map((t) => (
              <li key={t.tag}>
                <Link
                  href={`${tagBase}/${tagToSlug(t.tag)}`}
                  className="flex items-center justify-between rounded-lg border border-goukaku-divider bg-goukaku-surface/40 px-3 py-1.5 text-[12px] hover:bg-goukaku-surface"
                >
                  <span className="font-bold truncate">{t.tag}</span>
                  <span className="text-[11px] opacity-60 tabular-nums">
                    {t.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-7">
        <h2 className="text-[15px] font-extrabold mb-2 text-goukaku-ink/85">
          学習のコツ
        </h2>
        <p className="text-[13px] leading-[1.9] text-goukaku-ink/80">
          {meta.studyTips}
        </p>
      </section>

      {sampleQuestions.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[15px] font-extrabold mb-2 text-goukaku-ink/85">
            代表問題
          </h2>
          <p className="text-[11px] opacity-55 mb-2">
            この分野から代表的な問題を {sampleQuestions.length} 件抜粋
          </p>
          <ul className="space-y-1.5">
            {sampleQuestions.map(({ q, exam }) => {
              const preview = stripPlain(q.body).slice(0, 50)
              return (
                <li key={q._id}>
                  <Link
                    href={`${playBase}/${q.exam_id}/q/${q.q_number}`}
                    className="block rounded-lg border border-goukaku-divider px-3 py-2 hover:bg-goukaku-surface/60"
                  >
                    <span className="text-[11px] font-bold opacity-60">
                      {exam?.title ?? q.exam_id} 問{q.q_number}
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
        </section>
      )}

      <p className="text-[11px] opacity-60 pt-3 border-t border-goukaku-divider">
        他の分野: 上位ナビ または 試験ホーム から
      </p>
    </>
  )
}
