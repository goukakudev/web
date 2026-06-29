import type { Explanation, ChoiceLabel } from "@/lib/types"
import { TagChips } from "./TagChips"
import { MathText } from "./MathText"
import { stripAnswerReferenceTail } from "@/lib/question-display"
import { usedGlossaryTerms } from "@/lib/glossary"

export interface ExplanationCardProps {
  explanation: Explanation
  correctLabel: ChoiceLabel | undefined
  tags: string[]
  priorGlossaryTerms?: ReadonlySet<string>
  onGlossaryClick?: (term: string) => void
  subject?: "fe" | "ip" | "ap" | "sg" | "sc" | "dk"
  variant?: "default" | "denki"
}

export function ExplanationCard({
  explanation,
  correctLabel,
  tags,
  priorGlossaryTerms,
  onGlossaryClick,
  subject = "fe",
  variant = "default",
}: ExplanationCardProps) {
  const overallText = stripAnswerReferenceTail(explanation.overall)
  const overallExclude = priorGlossaryTerms ?? new Set<string>()
  const overallUsed = usedGlossaryTerms(overallText, overallExclude)

  const perChoiceExcludes: Set<string>[] = []
  const acc = new Set<string>([...overallExclude, ...overallUsed])
  for (const row of explanation.per_choice ?? []) {
    perChoiceExcludes.push(new Set(acc))
    const used = usedGlossaryTerms(row.text, acc)
    for (const t of used) acc.add(t)
  }

  const containerCls =
    variant === "denki"
      ? "bg-[#fffdf6] rounded-lg p-[18px] border-2 border-[#191815] shadow-[4px_4px_0_#191815] mt-4"
      : "bg-goukaku-surface rounded-[22px] p-[18px] border border-goukaku-divider mt-4"
  const answerCls =
    variant === "denki"
      ? "inline-flex items-center gap-1.5 bg-[#ffe25a] px-2.5 py-1.5 rounded-lg border border-[#191815]"
      : "inline-flex items-center gap-1.5 bg-goukaku-cool/35 px-2.5 py-1.5 rounded-[18px]"
  const dividerCls = variant === "denki" ? "h-px bg-[#d8d1bc]" : "h-px bg-goukaku-divider"

  return (
    <div className={containerCls}>
      <div className={answerCls}>
        <span className="text-[9px] tracking-[1.5px] font-extrabold text-[#007c83]">ANS</span>
        <span className="text-[14px] font-black text-[#191815]">{correctLabel ?? "-"}</span>
      </div>
      <div className="text-[13px] leading-[1.7] mt-3 font-medium">
        <MathText
          text={overallText}
          mathSize="sm"
          glossaryExclude={overallExclude}
          onGlossaryClick={onGlossaryClick}
        />
      </div>
      {explanation.per_choice && (
        <>
          <div className={`${dividerCls} my-3.5`} />
          {explanation.per_choice.map((row, idx) => (
            <div key={row.label} className="flex gap-2.5 py-2">
              <div className={variant === "denki" ? "w-[22px] font-black text-[#007c83]" : "w-[18px] font-extrabold text-goukaku-ink/50"}>{row.label}</div>
              <div className={variant === "denki" ? "text-[12px] leading-[1.6] text-[#4d473a]" : "text-[12px] leading-[1.6] text-goukaku-ink/75"}>
                <MathText
                  text={row.text}
                  mathSize="sm"
                  glossaryExclude={perChoiceExcludes[idx] ?? new Set<string>()}
                  onGlossaryClick={onGlossaryClick}
                />
              </div>
            </div>
          ))}
        </>
      )}
      {tags.length > 0 && (
        <>
          <div className={`${dividerCls} mt-3 mb-3`} />
          <TagChips tags={tags} subject={subject} variant={variant} />
        </>
      )}
    </div>
  )
}
