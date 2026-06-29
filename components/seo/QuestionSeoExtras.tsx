import Link from "next/link"
import type { Choice, ChoiceLabel, Explanation, QuestionStat } from "@/lib/types"
import { GlossaryInline } from "@/components/seo/GlossaryInline"

export interface QuestionSeoExtrasProps {
  /** 例: "ITパスポート試験"。固有の導入文に使う。 */
  subjectName: string
  examLabel: string
  qNumber: number
  body: string
  choices: Choice[]
  correctLabel?: ChoiceLabel
  explanation?: Explanation
  examUrl: string
  /** この設問の解答統計 (正答率)。無ければ正答率は出さない。 */
  stat?: QuestionStat
  tags?: string[]
  variant?: "default" | "denki"
}

function stripPlain(text: string): string {
  return text
    .replace(/\$[^$]+\$/g, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/[#*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * 設問ページの「解説」セクション (サーバー描画・可視)。
 *
 * 問題本文・選択肢はインタラクティブな出題 UI (PlayController) 側で既に可視
 * 描画されているため、ここでは重複させない。代わりに 正解 / 正答率 / 解説 /
 * 選択肢ごとの解説 と、設問ごとに内容が変わる導入文を可視テキストとして出し、
 * クロール時に「固有の価値を持つ実コンテンツページ」と判定されるようにする。
 * (以前はこの内容を sr-only で隠していたため、薄いページと見なされやすかった)
 */
export function QuestionSeoExtras({
  subjectName,
  examLabel,
  qNumber,
  body,
  choices,
  correctLabel,
  explanation,
  examUrl,
  stat,
  tags,
  variant = "default",
}: QuestionSeoExtrasProps) {
  const acceptedChoice = correctLabel
    ? choices.find((c) => c.label === correctLabel)
    : undefined
  const primaryTag = (tags ?? [])
    .map((t) => t.replace(/^#/, ""))
    .find((t) => t.length > 0)
  const rate =
    stat && stat.total > 0 ? (stat.correct / stat.total) * 100 : undefined
  const bodyPreview = stripPlain(body).slice(0, 40)

  const intro =
    `${examLabel} 問${qNumber}` +
    (bodyPreview ? `「${bodyPreview}…」` : "") +
    `の正解と解説です。${subjectName}` +
    (primaryTag ? `の「${primaryTag}」分野` : "") +
    `の過去問で、` +
    (rate !== undefined
      ? `これまでの受験者の正答率は約${Math.round(rate)}%です。`
      : `各選択肢の正誤も解説付きで確認できます。`)

  const sectionCls =
    variant === "denki"
      ? "mt-8 border-t-2 border-[#d8d1bc] pt-6 text-[13px] leading-[1.85]"
      : "mt-8 border-t border-goukaku-divider pt-6 text-[13px] leading-[1.85]"
  const mutedHeadingCls =
    variant === "denki"
      ? "mb-1.5 text-[13px] font-black text-[#6c6252]"
      : "text-[13px] font-bold text-goukaku-ink/55 mb-1.5"

  return (
    <section className={sectionCls} aria-label="この問題の正解と解説">
      <h2 className="text-[15px] font-extrabold mb-2.5 text-goukaku-ink/85">
        解説
      </h2>
      <p className="text-goukaku-ink/75 mb-5">{intro}</p>

      {acceptedChoice && correctLabel && (
        <div className="mb-5">
          <h3 className={mutedHeadingCls}>
            正解
          </h3>
          <p className="text-goukaku-ink/85">
            <span className="font-black">{correctLabel}.</span>{" "}
            {stripPlain(acceptedChoice.text)}
          </p>
          {rate !== undefined && stat && (
            <p className="text-[12px] text-goukaku-ink/55 mt-1.5 tabular-nums">
              正答率 {rate.toFixed(1)}%（
              {stat.total.toLocaleString("en-US")}人中{" "}
              {stat.correct.toLocaleString("en-US")}人が正解）
            </p>
          )}
        </div>
      )}

      {explanation?.overall && (
        <div className="mb-5">
          <h3 className={mutedHeadingCls}>
            問題の解説
          </h3>
          <p className="text-goukaku-ink/85">
            <GlossaryInline text={stripPlain(explanation.overall)} />
          </p>
        </div>
      )}

      {explanation?.per_choice && explanation.per_choice.length > 0 && (
        <div className="mb-5">
          <h3 className={variant === "denki" ? "mb-2 text-[13px] font-black text-[#6c6252]" : "text-[13px] font-bold text-goukaku-ink/55 mb-2"}>
            選択肢ごとの解説
          </h3>
          <ul className="space-y-2">
            {explanation.per_choice.map((pc) => (
              <li key={pc.label} className="flex gap-2.5">
                <span className="w-[18px] shrink-0 font-extrabold text-goukaku-ink/50">
                  {pc.label}
                </span>
                <span className="text-goukaku-ink/75">
                  <GlossaryInline text={stripPlain(pc.text)} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={variant === "denki" ? "border-t border-[#d8d1bc] pt-3 text-[11px] opacity-60" : "text-[11px] opacity-60 pt-3 border-t border-goukaku-divider"}>
        <Link href={examUrl} className="underline">
          {examLabel} の過去問一覧
        </Link>
        に戻る・問{qNumber}
      </p>
    </section>
  )
}
