import Link from "next/link"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { JsonLd } from "@/components/seo/JsonLd"
import { MathText } from "@/components/play/MathText"
import type { ExamSummary, Question } from "@/lib/types"
import {
  questionJsonLd,
  webPageJsonLd,
  SITE_URL,
} from "@/lib/seo/structured-data"
import { termToSlug } from "@/lib/seo/glossary"
import {
  formatExamLabel,
  pickQuestionTopic,
  questionCanonicalPath,
  questionPlayPath,
  questionSeoDescription,
  questionSeoTitle,
  SEO_QUESTION_SUBJECTS,
  type SeoQuestionSubject,
} from "@/lib/seo/question-url"
import {
  relatedGlossaryTerms,
  relatedQuestionLinks,
} from "@/lib/seo/question-related"
import { stripMd } from "@/lib/text-utils"

interface QuestionArticleProps {
  subject: SeoQuestionSubject
  exam: ExamSummary
  question: Question
  examQuestions: Question[]
}

const IOS_APP_URLS: Partial<Record<SeoQuestionSubject, string>> = {
  ip: "https://apps.apple.com/jp/app/goukaku-itパスポート-過去問/id6774202965",
  fe: "https://apps.apple.com/jp/app/基本情報技術者-過去問/id6770801070",
  sg: "https://apps.apple.com/app/goukaku-情報セキュリティマネジメント-過去問/id6776073219",
}

export function QuestionArticle({
  subject,
  exam,
  question,
  examQuestions,
}: QuestionArticleProps) {
  const config = SEO_QUESTION_SUBJECTS[subject]
  const canonicalPath = questionCanonicalPath(subject, exam, question)
  const canonicalUrl = `${SITE_URL}${canonicalPath}`
  const playPath = questionPlayPath(subject, exam.exam_id, question.q_number)
  const examLabel = formatExamLabel(exam, subject)
  const topic = pickQuestionTopic(question)
  const acceptedChoice = question.correct_label
    ? question.choices.find((choice) => choice.label === question.correct_label)
    : undefined
  const relatedTerms = relatedGlossaryTerms(question)
  const relatedQuestions = relatedQuestionLinks(subject, exam, question, examQuestions)
  const prev = examQuestions.find((q) => q.q_number === question.q_number - 1)
  const next = examQuestions.find((q) => q.q_number === question.q_number + 1)

  return (
    <>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: config.fullName, href: `/${subject}` },
        { name: "問題解説", href: config.questionsPath },
        { name: examLabel, href: `${config.examPath}/${exam.exam_id}` },
        { name: `問${question.q_number}`, href: canonicalPath },
      ]} />
      <JsonLd
        data={webPageJsonLd({
          name: questionSeoTitle(subject, exam, question),
          description: questionSeoDescription(subject, exam, question),
          url: canonicalUrl,
        })}
      />
      <JsonLd
        data={questionJsonLd({
          name: `${topic} - ${config.fullName} ${examLabel} 問${question.q_number}`,
          text: stripMd(question.body),
          url: canonicalUrl,
          choices: question.choices.map((choice) => ({
            label: choice.label,
            text: stripMd(choice.text),
          })),
          correctLabel: question.correct_label,
          explanation: question.explanation?.overall
            ? stripMd(question.explanation.overall)
            : undefined,
          partOfName: `${config.fullName} ${examLabel} 過去問`,
          partOfUrl: `${SITE_URL}${config.examPath}/${exam.exam_id}`,
        })}
      />

      <article className="text-[13px] leading-[1.85] text-goukaku-ink/85">
        <p className="text-[11px] font-bold tracking-[1.2px] text-goukaku-ink/50 uppercase">
          {config.fullName} 過去問解説
        </p>
        <h1 className="mt-1 text-[22px] font-extrabold leading-[1.45] text-goukaku-ink">
          {topic}とは？{config.fullName} {examLabel} 問{question.q_number}を解説
        </h1>
        <p className="mt-3 text-goukaku-ink/72">
          {config.fullName} {examLabel} 問{question.q_number}は、
          <strong>{topic}</strong>
          に関する理解を問う問題です。問題文、選択肢、正解、各選択肢がなぜ正しいか・なぜ違うかを確認できます。
        </p>

        <div className="mt-5 grid grid-cols-1 gap-2">
          <Link
            href={playPath}
            className="inline-flex items-center justify-center rounded-lg bg-goukaku-ink-fixed px-4 py-3 text-[13px] font-extrabold text-goukaku-lime"
            data-analytics-event="start_practice_click"
            data-analytics-props={JSON.stringify({
              subject,
              exam_id: exam.exam_id,
              q_number: question.q_number,
              source: "question_seo",
            })}
          >
            アプリ形式でこの問題を解く
          </Link>
          <Link
            href="/pro"
            className="inline-flex items-center justify-center rounded-lg border border-goukaku-divider bg-goukaku-surface px-4 py-3 text-[13px] font-extrabold text-goukaku-ink/80"
            data-analytics-event="pro_cta_click"
            data-analytics-props={JSON.stringify({ subject, source: "question_seo_top" })}
          >
            弱点分析・復習リマインダーを見る
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="text-[16px] font-extrabold text-goukaku-ink">
            問題文
          </h2>
          <div className="mt-3 rounded-xl border border-goukaku-divider bg-goukaku-surface/50 p-4 font-semibold text-goukaku-ink">
            <MathText text={question.body} glossaryEnabled={false} />
            {question.figures && question.figures.length > 0 && (
              <div className="mt-3 flex flex-col gap-3">
                {question.figures.map((figure) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={figure.id}
                    src={figure.url}
                    alt={figure.alt ?? ""}
                    loading="lazy"
                    className="h-auto max-w-full rounded-md border border-goukaku-divider bg-white"
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-[16px] font-extrabold text-goukaku-ink">
            選択肢
          </h2>
          <ol className="mt-3 space-y-2">
            {question.choices.map((choice) => {
              const isCorrect = choice.label === question.correct_label
              return (
                <li
                  key={choice.label}
                  className="rounded-xl border border-goukaku-divider bg-goukaku-surface/35 p-3"
                >
                  <span className="mr-2 font-black text-goukaku-ink">
                    {choice.label}
                  </span>
                  <MathText text={choice.text} glossaryEnabled={false} />
                  {isCorrect && (
                    <span className="ml-2 rounded-full bg-goukaku-lime px-2 py-0.5 text-[11px] font-extrabold text-goukaku-ink-fixed">
                      正解
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        {acceptedChoice && question.correct_label && (
          <section className="mt-7 rounded-xl border border-goukaku-divider bg-goukaku-lime/25 p-4">
            <h2 className="text-[16px] font-extrabold text-goukaku-ink">
              正解
            </h2>
            <p className="mt-2">
              <span className="font-black">{question.correct_label}</span>
              {" : "}
              <MathText text={acceptedChoice.text} glossaryEnabled={false} />
            </p>
          </section>
        )}

        {question.explanation?.overall && (
          <section className="mt-7">
            <h2 className="text-[16px] font-extrabold text-goukaku-ink">
              解説
            </h2>
            <div className="mt-3 rounded-xl border border-goukaku-divider bg-white/45 p-4">
              <MathText text={question.explanation.overall} glossaryEnabled={false} />
            </div>
          </section>
        )}

        {question.explanation?.per_choice && question.explanation.per_choice.length > 0 && (
          <section className="mt-7">
            <h2 className="text-[16px] font-extrabold text-goukaku-ink">
              なぜ他の選択肢が違うのか
            </h2>
            <ul className="mt-3 space-y-2">
              {question.explanation.per_choice.map((choice) => (
                <li
                  key={choice.label}
                  className="rounded-xl border border-goukaku-divider bg-goukaku-surface/35 p-3"
                >
                  <p className="font-black text-goukaku-ink">
                    {choice.label}
                    {choice.label === question.correct_label ? "（正解）" : ""}
                  </p>
                  <p className="mt-1">
                    <MathText text={choice.text} glossaryEnabled={false} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedTerms.length > 0 && (
          <section className="mt-7">
            <h2 className="text-[16px] font-extrabold text-goukaku-ink">
              関連用語
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {relatedTerms.map((term) => (
                <li key={term.term}>
                  <Link
                    href={`/glossary/${termToSlug(term.term)}`}
                    className="block rounded-lg border border-goukaku-divider bg-goukaku-surface/35 px-3 py-2"
                    data-analytics-event="glossary_link_click"
                    data-analytics-props={JSON.stringify({
                      term: term.term,
                      source: "question_seo",
                    })}
                  >
                    <span className="font-bold">{term.term}</span>
                    <span className="block text-[10px] opacity-55">
                      {term.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8 border-t border-goukaku-divider pt-6">
          <h2 className="text-[16px] font-extrabold text-goukaku-ink">
            関連問題
          </h2>
          <nav aria-label="前後の問題" className="mt-3 grid grid-cols-2 gap-2">
            {prev ? (
              <QuestionLink
                href={questionCanonicalPath(subject, exam, prev)}
                label={`問${prev.q_number}`}
                body={prev.body}
                analyticsProps={{ subject, relation: "prev" }}
              />
            ) : (
              <span />
            )}
            {next ? (
              <QuestionLink
                href={questionCanonicalPath(subject, exam, next)}
                label={`問${next.q_number}`}
                body={next.body}
                align="right"
                analyticsProps={{ subject, relation: "next" }}
              />
            ) : (
              <span />
            )}
          </nav>

          {relatedQuestions.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] text-goukaku-ink/55">
                {examLabel} の関連する問題
              </p>
              <ul className="mt-2 space-y-2">
                {relatedQuestions.map((related) => (
                  <li key={related.question._id}>
                    <QuestionLink
                      href={questionCanonicalPath(subject, exam, related.question)}
                      label={`問${related.question.q_number}`}
                      body={related.question.body}
                    tag={related.label}
                    analyticsProps={{ subject, relation: related.reason }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
            <Link href={`${config.examPath}/${exam.exam_id}`} className="underline">
              {examLabel} の問題一覧
            </Link>
            <Link href={config.questionsPath} className="underline">
              {config.fullName}の解説一覧
            </Link>
          </div>
        </section>

        <QuestionMonetizationCta subject={subject} />
      </article>
    </>
  )
}

function QuestionLink({
  href,
  label,
  body,
  tag,
  align,
  analyticsProps,
}: {
  href: string
  label: string
  body: string
  tag?: string
  align?: "right"
  analyticsProps: Record<string, string>
}) {
  const preview = stripMd(body).slice(0, 54)
  return (
    <Link
      href={href}
      className={`block rounded-lg border border-goukaku-divider bg-goukaku-surface/35 px-3 py-2 ${
        align === "right" ? "text-right" : ""
      }`}
      data-analytics-event="related_question_click"
      data-analytics-props={JSON.stringify(analyticsProps)}
    >
      <span className="text-[11px] font-bold opacity-60">
        {label}
        {tag && <span className="ml-2 text-goukaku-pink-script">{tag}</span>}
      </span>
      <span className="mt-0.5 block text-[12px]">
        {preview}
        {preview.length === 54 ? "..." : ""}
      </span>
    </Link>
  )
}

function QuestionMonetizationCta({ subject }: { subject: SeoQuestionSubject }) {
  const config = SEO_QUESTION_SUBJECTS[subject]
  const iosUrl = IOS_APP_URLS[subject]
  return (
    <section className="mt-8 rounded-xl border border-goukaku-divider bg-goukaku-surface px-4 py-5">
      <h2 className="text-[15px] font-extrabold text-goukaku-ink">
        復習を続ける
      </h2>
      <p className="mt-2 text-[12px] leading-relaxed text-goukaku-ink/65">
        間違えた問題、苦手タグ、模試履歴を保存して復習する導線を用意しています。
        広告なしPro、弱点分析、復習リマインダーは段階的に提供予定です。
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2">
        <Link
          href="/pro"
          className="inline-flex items-center justify-center rounded-lg bg-goukaku-ink-fixed px-4 py-3 text-[13px] font-extrabold text-goukaku-lime"
          data-analytics-event="pro_cta_click"
          data-analytics-props={JSON.stringify({ subject, source: "question_seo_bottom" })}
        >
          Pro機能を見る
        </Link>
        {iosUrl && (
          <a
            href={iosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-goukaku-divider bg-white/45 px-4 py-3 text-[13px] font-extrabold text-goukaku-ink/80"
            data-analytics-event="app_store_click"
            data-analytics-props={JSON.stringify({
              subject,
              source: "question_seo_bottom",
            })}
          >
            {config.shortName}アプリを開く
          </a>
        )}
      </div>
    </section>
  )
}
