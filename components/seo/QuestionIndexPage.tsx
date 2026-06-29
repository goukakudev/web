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

export function QuestionIndexPage({
  subject,
  groups,
  totalQuestions,
}: {
  subject: SeoQuestionSubject
  groups: QuestionIndexGroup[]
  totalQuestions: number
}) {
  const config = SEO_QUESTION_SUBJECTS[subject]
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
          現在の収録数は {totalQuestions.toLocaleString("ja-JP")} 問です。
        </p>
      </header>

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
            <strong>年度単位で確認する</strong>: 年度ページでは、その回の問題一覧と演習開始ボタンを確認できます。
          </li>
        </ul>
      </section>

      <div className="mt-8 space-y-8">
        {groups.map(({ exam, questions }) => {
          const examLabel = formatExamLabel(exam, subject)
          return (
            <section key={exam.exam_id}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-extrabold">
                    {examLabel}
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
            </section>
          )
        })}
      </div>
    </>
  )
}
