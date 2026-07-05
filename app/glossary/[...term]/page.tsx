import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { SITE_URL, SITE_NAME } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import {
  findRelated,
  resolveGlossarySlug,
  termToSlug,
} from "@/lib/seo/glossary"
import { glossaryQuality } from "@/lib/seo/glossary-quality"
import {
  listExams,
  listIpExams,
  listIpQuestions,
  listQuestions,
  listSgExams,
  listSgQuestions,
} from "@/lib/api-client"
import {
  formatExamLabel,
  questionCanonicalPath,
  SEO_QUESTION_SUBJECTS,
  type SeoQuestionSubject,
} from "@/lib/seo/question-url"
import { questionContainsTerm } from "@/lib/seo/question-related"
import { studyProfileForCategory } from "@/lib/seo/glossary-study-profile"
import {
  getGlossaryTermEnrichment,
  scoreGlossaryQuestionText,
} from "@/lib/seo/glossary-term-enrichment"
import type { ExamSummary, Question } from "@/lib/types"
import { stripMd } from "@/lib/text-utils"

interface PageProps {
  params: Promise<{ term: string[] }>
}

// 用語データはローカル JSON だが、generateStaticParams による静的 prerender は
// 使わない。Next.js 16 では非 ASCII の動的セグメントを prerender すると、ビルド時に
// 渡る params とランタイムのリクエストが一致せず全件 404 になる不具合がある
// (encodeURIComponent して返しても raw で返しても 404)。動的ルート(takken の
// 分野別ページと同方式)にすれば日本語 URL も正しく解決できる。データは外部 API を
// 叩かないため、revalidate でレスポンスをキャッシュすればコストも無視できる。
// catch-all ([...term]) なのは、旧 URL 形式で用語中のスラッシュが生のまま
// パスに入った /glossary/S/MIME のようなリクエストを受けて 308 で正規スラッグへ
// 送るため (単一セグメントの [term] だと 2 セグメント時点で 404 になる)。
export const revalidate = 86400

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // 動的セグメントの params はエンコード済みで渡るため decode してから引く。
  const { term: segments } = await params
  const resolved = resolveGlossarySlug(segments)
  if (!resolved) return {}
  const { entry } = resolved
  const preview = entry.description.slice(0, 90)
  const quality = glossaryQuality(entry)
  const enrichment = getGlossaryTermEnrichment(entry.term)
  return makeMetadata({
    title: `${entry.term}とは？ITパスポート・基本情報の過去問での意味`,
    description: enrichment
      ? `${entry.term}(${entry.reading})の意味、具体例、間違えやすい選択肢、関連する過去問を解説。${preview}…`
      : `${entry.term}(${entry.reading})の意味、ITパスポートでの出題ポイント、問われ方、関連する過去問と関連用語を解説。${preview}…`,
    path: `/glossary/${termToSlug(entry.term)}`,
    type: "article",
    noindex: !quality.indexable,
  })
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { term: segments } = await params
  // レガシー URL (生用語・%2F 入り・生スラッシュで複数セグメント・連番
  // サフィックス) はすべて resolveGlossarySlug が拾い、正規スラッグへ 308。
  const resolved = resolveGlossarySlug(segments)
  if (!resolved) notFound()
  const { entry, canonicalSlug } = resolved
  if (!resolved.isCanonical) {
    permanentRedirect(`/glossary/${canonicalSlug}`)
  }
  const related = findRelated(entry, 6)
  const relatedQuestions = await findRelatedQuestions(entry.term)
  const quality = glossaryQuality(entry)
  const studyProfile = studyProfileForCategory(entry.category)
  const enrichment = getGlossaryTermEnrichment(entry.term)

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "用語集", href: "/glossary" },
        { name: entry.term, href: `/glossary/${canonicalSlug}` },
      ]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: entry.term,
          alternateName: entry.reading,
          description: entry.description,
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: `${SITE_NAME} 用語集`,
            url: `${SITE_URL}/glossary`,
          },
          url: `${SITE_URL}/glossary/${canonicalSlug}`,
          inLanguage: "ja",
        }}
      />

      <p className="text-[11px] tracking-[1.2px] text-goukaku-ink/55 uppercase mb-1">
        {entry.category}
      </p>
      <h1 className="text-[24px] font-extrabold mb-1">
        {entry.term}とは
      </h1>
      <p className="text-[12px] opacity-60 mb-5">{entry.reading}</p>
      {!quality.indexable && (
        <p className="mb-5 rounded-lg border border-goukaku-divider bg-goukaku-surface/45 px-3 py-2 text-[11px] leading-relaxed text-goukaku-ink/60">
          この用語ページは内容を拡充中のため、検索向けのsitemapからは一時的に外しています。関連過去問や比較説明を追加した後にindex対象へ戻します。
        </p>
      )}

      <section className="mb-7">
        <h2 className="text-[13px] font-bold text-goukaku-ink/60 mb-2">定義</h2>
        <p className="text-[13px] leading-[1.85] text-goukaku-ink/85">
          {entry.description}
        </p>
      </section>

      <section className="mb-7">
        <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
          ITパスポート・基本情報での出題ポイント
        </h2>
        <p className="text-[13px] leading-[1.85] text-goukaku-ink/85">
          {studyProfile.examPoint}
        </p>
      </section>

      {enrichment && (
        <section className="mb-7">
          <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
            具体例で理解する
          </h2>
          <div className="space-y-2">
            {enrichment.examples.map((example) => (
              <div
                key={example.title}
                className="rounded-lg border border-goukaku-divider bg-goukaku-surface/35 px-3 py-3"
              >
                <h3 className="text-[12px] font-extrabold text-goukaku-ink/80">
                  {example.title}
                </h3>
                <p className="mt-1 text-[12px] leading-[1.75] text-goukaku-ink/75">
                  {example.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-7">
        <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
          よく問われるパターン
        </h2>
        <ul className="space-y-2 text-[13px] leading-[1.75] text-goukaku-ink/80">
          {studyProfile.patterns.map((pattern) => (
            <li key={pattern}>{pattern}</li>
          ))}
        </ul>
      </section>

      {enrichment && (
        <section className="mb-7">
          <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
            選択肢で狙われる違い
          </h2>
          <ul className="space-y-2">
            {enrichment.mistakes.map((mistake) => (
              <li
                key={mistake.trap}
                className="rounded-lg border border-goukaku-divider bg-goukaku-surface/30 px-3 py-3"
              >
                <p className="text-[12px] font-bold leading-[1.6] text-goukaku-ink/75">
                  {mistake.trap}
                </p>
                <p className="mt-1 text-[12px] leading-[1.7] text-goukaku-ink/65">
                  {mistake.point}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedQuestions.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
            関連する過去問
          </h2>
          <ul className="space-y-2">
            {relatedQuestions.map((item) => {
              const config = SEO_QUESTION_SUBJECTS[item.subject]
              const href = questionCanonicalPath(item.subject, item.exam, item.question)
              const preview = stripMd(item.question.body).slice(0, 58)
              return (
                <li key={`${item.subject}-${item.question._id}`}>
                  <Link
                    href={href}
                    className="block rounded-lg border border-goukaku-divider bg-goukaku-surface/35 px-3 py-2"
                    data-analytics-event="related_question_click"
                    data-analytics-props={JSON.stringify({
                      subject: item.subject,
                      source: "glossary",
                      term: entry.term,
                    })}
                  >
                    <span className="text-[11px] font-bold text-goukaku-ink/55">
                      {config.shortName} {formatExamLabel(item.exam, item.subject)} 問{item.question.q_number}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-goukaku-ink/78">
                      {preview}
                      {preview.length === 58 ? "..." : ""}
                    </span>
                    {item.matchedKeywords.length > 0 && (
                      <span className="mt-1 block text-[10px] font-bold text-goukaku-ink/45">
                        関連: {item.matchedKeywords.join(" / ")}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
            関連用語({entry.category})
          </h2>
          <ul className="grid grid-cols-2 gap-1.5">
            {related.map((r) => (
              <li key={r.term}>
                <Link
                  href={`/glossary/${termToSlug(r.term)}`}
                  className="block rounded-lg border border-goukaku-divider bg-goukaku-surface/40 px-3 py-2 text-[12px] hover:bg-goukaku-surface"
                >
                  <span className="font-bold">{r.term}</span>
                  <span className="block text-[10px] opacity-55 mt-0.5">
                    {r.reading}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
            間違えやすい用語との違い
          </h2>
          <p className="text-[13px] leading-[1.85] text-goukaku-ink/85">
            {entry.term}と同じ「{entry.category}」の用語では、
            {related.slice(0, 3).map((r) => r.term).join("、")}
            などが近い文脈で問われます。{studyProfile.compareAxis}
          </p>
        </section>
      )}

      <p className="text-[11px] opacity-60 pt-6 mt-8 border-t border-goukaku-divider">
        ← <Link href="/glossary" className="underline">用語集インデックス</Link>
      </p>
    </MobileFrame>
  )
}

interface RelatedQuestionRef {
  subject: SeoQuestionSubject
  exam: ExamSummary
  question: Question
  matchedKeywords: string[]
  score: number
}

async function findRelatedQuestions(term: string): Promise<RelatedQuestionRef[]> {
  const isPriorityTerm = Boolean(getGlossaryTermEnrichment(term))
  const limit = isPriorityTerm ? 12 : 8
  const all = await Promise.allSettled([
    collectSubjectQuestions("ip", isPriorityTerm),
    collectSubjectQuestions("fe", isPriorityTerm),
    collectSubjectQuestions("sg", isPriorityTerm),
  ])
  return all
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .map((item) => {
      const scored = scoreGlossaryQuestionText(
        term,
        questionSearchTextWithTags(item.question),
      )
      return { ...item, ...scored }
    })
    .filter((item) => item.score >= 70 || questionContainsTerm(item.question, term))
    .sort((a, b) => {
      const score = b.score - a.score
      if (score !== 0) return score
      const subjectOrder = { ip: 0, fe: 1, sg: 2 }
      const subject = subjectOrder[a.subject] - subjectOrder[b.subject]
      if (subject !== 0) return subject
      return b.exam.exam_id.localeCompare(a.exam.exam_id) || a.question.q_number - b.question.q_number
    })
    .slice(0, limit)
}

async function collectSubjectQuestions(
  subject: SeoQuestionSubject,
  includeAllExams = false,
): Promise<RelatedQuestionRef[]> {
  const exams = await listSubjectExams(subject)
  const recent = includeAllExams ? exams : exams.slice(0, subject === "ip" ? 10 : 8)
  const questionLists = await Promise.all(
    recent.map((exam) => listSubjectQuestions(subject, exam.exam_id).catch(() => [])),
  )
  return recent.flatMap((exam, index) =>
    questionLists[index].map((question) => ({
      subject,
      exam,
      question,
      matchedKeywords: [],
      score: 0,
    })),
  )
}

function questionSearchTextWithTags(question: Question): string {
  return stripMd(
    [
      question.body,
      ...question.choices.map((choice) => choice.text),
      question.explanation?.overall ?? "",
      ...(question.explanation?.per_choice ?? []).map((choice) => choice.text),
      ...(question.tags ?? []),
    ].join(" "),
  )
}

async function listSubjectExams(subject: SeoQuestionSubject): Promise<ExamSummary[]> {
  if (subject === "ip") return listIpExams()
  if (subject === "sg") return listSgExams()
  return (await listExams()).filter((exam) => exam.exam_id.startsWith("fe-"))
}

async function listSubjectQuestions(
  subject: SeoQuestionSubject,
  examId: string,
): Promise<Question[]> {
  if (subject === "ip") return listIpQuestions(examId)
  if (subject === "sg") return listSgQuestions(examId)
  return listQuestions(examId)
}
