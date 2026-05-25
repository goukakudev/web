import type { Choice, ChoiceLabel, Explanation } from "@/lib/types"

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
    <details className="mt-6 rounded-2xl border border-goukaku-divider bg-goukaku-surface/40 px-4 py-3 text-[13px] leading-relaxed">
      <summary className="cursor-pointer font-extrabold text-goukaku-ink/80 text-[13px]">
        この問題の本文・選択肢・正解・解説(展開)
      </summary>
      <div className="mt-4 space-y-4 text-goukaku-ink/85">
        <section>
          <h3 className="text-[12px] font-bold opacity-60 mb-1">問題本文</h3>
          <p>{stripPlain(body)}</p>
        </section>

        <section>
          <h3 className="text-[12px] font-bold opacity-60 mb-1">選択肢</h3>
          <ul className="space-y-1">
            {choices.map((c) => (
              <li key={c.label}>
                <span className="font-bold mr-1">{c.label}.</span>
                {stripPlain(c.text)}
              </li>
            ))}
          </ul>
        </section>

        {acceptedChoice && correctLabel && (
          <section>
            <h3 className="text-[12px] font-bold opacity-60 mb-1">正解</h3>
            <p>
              <span className="font-bold">{correctLabel}.</span>{" "}
              {stripPlain(acceptedChoice.text)}
            </p>
          </section>
        )}

        {explanation?.overall && (
          <section>
            <h3 className="text-[12px] font-bold opacity-60 mb-1">解説</h3>
            <p>{stripPlain(explanation.overall)}</p>
          </section>
        )}

        {explanation?.per_choice && explanation.per_choice.length > 0 && (
          <section>
            <h3 className="text-[12px] font-bold opacity-60 mb-1">選択肢ごとの解説</h3>
            <ul className="space-y-1.5">
              {explanation.per_choice.map((pc) => (
                <li key={pc.label}>
                  <span className="font-bold mr-1">{pc.label}.</span>
                  {stripPlain(pc.text)}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-[11px] opacity-55 pt-2 border-t border-goukaku-divider">
          {examLabel} の<a className="underline" href={examUrl}>過去問一覧</a>へ戻る・問{qNumber}
        </p>
      </div>
    </details>
  )
}
