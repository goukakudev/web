import type { Choice, ChoiceLabel, Explanation } from "@/lib/types"
import { GlossaryInline } from "@/components/seo/GlossaryInline"

export interface QuestionSeoExtrasProps {
  examLabel: string
  qNumber: number
  body: string
  choices: Choice[]
  correctLabel?: ChoiceLabel
  explanation?: Explanation
  examUrl: string
}

function stripPlain(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/[#*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function QuestionSeoExtras({
  examLabel,
  qNumber,
  body,
  choices,
  correctLabel,
  explanation,
  examUrl,
}: QuestionSeoExtrasProps) {
  const acceptedChoice = correctLabel
    ? choices.find((c) => c.label === correctLabel)
    : undefined

  return (
    <section className="sr-only" aria-label="この問題の本文・選択肢・正解・解説 (検索エンジン用)">
      <section>
        <h3>問題本文</h3>
        <p>
          <GlossaryInline text={stripPlain(body)} />
        </p>
      </section>

      <section>
        <h3>選択肢</h3>
        <ul>
          {choices.map((c) => (
            <li key={c.label}>
              <span>{c.label}.</span>
              {stripPlain(c.text)}
            </li>
          ))}
        </ul>
      </section>

      {acceptedChoice && correctLabel && (
        <section>
          <h3>正解</h3>
          <p>
            <span>{correctLabel}.</span> {stripPlain(acceptedChoice.text)}
          </p>
        </section>
      )}

      {explanation?.overall && (
        <section>
          <h3>解説</h3>
          <p>
            <GlossaryInline text={stripPlain(explanation.overall)} />
          </p>
        </section>
      )}

      {explanation?.per_choice && explanation.per_choice.length > 0 && (
        <section>
          <h3>選択肢ごとの解説</h3>
          <ul>
            {explanation.per_choice.map((pc) => (
              <li key={pc.label}>
                <span>{pc.label}.</span>
                {stripPlain(pc.text)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p>
        {examLabel} の<a href={examUrl}>過去問一覧</a>へ戻る・問{qNumber}
      </p>
    </section>
  )
}
