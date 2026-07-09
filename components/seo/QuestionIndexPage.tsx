import Link from "next/link"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { JsonLd } from "@/components/seo/JsonLd"
import type { ExamSummary, Question } from "@/lib/types"
import { itemListJsonLd, SITE_URL } from "@/lib/seo/structured-data"
import {
  formatExamLabel,
  pickQuestionTopic,
  questionCanonicalPath,
  SEO_QUESTION_SUBJECTS,
  type SeoQuestionSubject,
} from "@/lib/seo/question-url"
import { stripMd } from "@/lib/text-utils"

export interface QuestionIndexGroup {
  exam: ExamSummary
  questions: Question[]
}

const SUBJECT_GUIDE: Partial<
  Record<SeoQuestionSubject, { guide: string; faq: string }>
> = {
  ip: { guide: "/ip/guide", faq: "/ip/faq" },
  fe: { guide: "/fe/guide", faq: "/fe/faq" },
  sg: { guide: "/sg/guide", faq: "/sg/faq" },
}

export function QuestionIndexPage({
  subject,
  groups,
  totalQuestions,
  allExams,
}: {
  subject: SeoQuestionSubject
  groups: QuestionIndexGroup[]
  totalQuestions: number
  /** 収録全試験回。一覧に載らない回も含め、試験回ハブへの内部リンク用。 */
  allExams?: ExamSummary[]
}) {
  const config = SEO_QUESTION_SUBJECTS[subject]
  const guides = SUBJECT_GUIDE[subject]
  const examLedger = allExams ?? groups.map((g) => g.exam)
  const items = groups.flatMap(({ exam, questions }) =>
    questions.slice(0, 12).map((question) => ({
      name: `${formatExamLabel(exam, subject)} 問${question.q_number} ${pickQuestionTopic(question)}`,
      url: `${SITE_URL}${questionCanonicalPath(subject, exam, question)}`,
    })),
  )

  return (
    <>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: config.fullName, href: `/${subject}` },
        { name: "問題解説", href: config.questionsPath },
      ]} />
      <JsonLd data={itemListJsonLd(items)} />

      <header>
        <p className="text-[11px] font-bold tracking-[1.2px] text-goukaku-ink/50 uppercase">
          Question explanations
        </p>
        <h1 className="mt-1 text-[22px] font-extrabold leading-[1.45]">
          {config.fullName}の過去問解説一覧
        </h1>
        <p className="mt-3 text-[13px] leading-[1.85] text-goukaku-ink/72">
          {config.fullName}の過去問を、問題ごとの解説ページとして整理しています。
          問題文、選択肢、正解、選択肢別解説、関連用語へのリンクを確認できます。
          現在の収録数は {totalQuestions.toLocaleString("ja-JP")} 問
          {examLedger.length > 0
            ? `（${examLedger.length.toLocaleString("ja-JP")} 回分）`
            : ""}
          です。
        </p>
      </header>

      <section className="mt-7 rounded-xl border border-goukaku-divider bg-goukaku-surface/45 p-4">
        <h2 className="text-[15px] font-extrabold">関連ページ</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-[12px]">
          <li>
            <Link
              href={`/${subject}`}
              className="inline-block rounded-full border border-goukaku-divider bg-goukaku-surface px-3 py-1.5 font-bold hover:border-goukaku-ink/40"
            >
              {config.shortName}トップ
            </Link>
          </li>
          {guides && (
            <>
              <li>
                <Link
                  href={guides.guide}
                  className="inline-block rounded-full border border-goukaku-divider bg-goukaku-surface px-3 py-1.5 font-bold hover:border-goukaku-ink/40"
                >
                  学習ガイド
                </Link>
              </li>
              <li>
                <Link
                  href={guides.faq}
                  className="inline-block rounded-full border border-goukaku-divider bg-goukaku-surface px-3 py-1.5 font-bold hover:border-goukaku-ink/40"
                >
                  FAQ
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              href="/glossary"
              className="inline-block rounded-full border border-goukaku-divider bg-goukaku-surface px-3 py-1.5 font-bold hover:border-goukaku-ink/40"
            >
              用語集
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-7 rounded-xl border border-goukaku-divider bg-goukaku-surface/45 p-4">
        <h2 className="text-[15px] font-extrabold">使い分け</h2>
        <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-goukaku-ink/72">
          <li>
            <strong>検索から調べる</strong>: この一覧から、用語・年度・問番号が分かる解説ページへ移動します。
          </li>
          <li>
            <strong>連続して解く</strong>: 各解説ページの「アプリ形式でこの問題を解く」から演習画面へ移動します。
          </li>
          <li>
            <strong>年度単位で確認する</strong>: 下の「収録試験回」または各セクションの「年度ページ」から、その回の全問一覧と演習モードを開けます。
          </li>
        </ul>
      </section>

      {examLedger.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[16px] font-extrabold">収録試験回</h2>
          <p className="mt-1 text-[12px] text-goukaku-ink/60 leading-relaxed">
            各回のハブから順番・ランダム・模試モードと、問題ごとの解説へ進めます。
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {examLedger.map((exam) => {
              const label = formatExamLabel(exam, subject)
              return (
                <li key={exam.exam_id}>
                  <Link
                    href={`${config.examPath}/${exam.exam_id}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-goukaku-divider bg-goukaku-surface/35 px-3 py-2 text-[12px] hover:bg-goukaku-surface"
                  >
                    <span className="font-bold truncate">{label}</span>
                    <span className="shrink-0 tabular-nums text-goukaku-ink/55">
                      {exam.question_count} 問
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="mt-8 space-y-8">
        {groups.map(({ exam, questions }) => {
          const examLabel = formatExamLabel(exam, subject)
          return (
            <section key={exam.exam_id}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-extrabold">
                    <Link
                      href={`${config.examPath}/${exam.exam_id}`}
                      className="hover:underline"
                    >
                      {examLabel}
                    </Link>
                  </h2>
                  <p className="mt-0.5 text-[11px] text-goukaku-ink/55">
                    {questions.length} 問
                  </p>
                </div>
                <Link
                  href={`${config.examPath}/${exam.exam_id}`}
                  className="text-[12px] font-bold underline"
                >
                  年度ページ
                </Link>
              </div>
              <ul className="mt-3 space-y-2">
                {questions.slice(0, 12).map((question) => {
                  const topic = pickQuestionTopic(question)
                  const preview = stripMd(question.body).slice(0, 58)
                  return (
                    <li key={question._id}>
                      <Link
                        href={questionCanonicalPath(subject, exam, question)}
                        className="block rounded-lg border border-goukaku-divider bg-goukaku-surface/35 px-3 py-2"
                        data-analytics-event="related_question_click"
                        data-analytics-props={JSON.stringify({
                          subject,
                          source: "question_index",
                        })}
                      >
                        <span className="text-[11px] font-bold text-goukaku-ink/55">
                          問{question.q_number}・{topic}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-goukaku-ink/78">
                          {preview}
                          {preview.length === 58 ? "..." : ""}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              {questions.length > 12 && (
                <p className="mt-2 text-[12px]">
                  <Link
                    href={`${config.examPath}/${exam.exam_id}`}
                    className="font-bold underline"
                  >
                    残り {questions.length - 12} 問は年度ページで見る →
                  </Link>
                </p>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}
