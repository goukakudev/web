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
}

export function ExplanationCard({
  explanation,
  correctLabel,
  tags,
  priorGlossaryTerms,
  onGlossaryClick,
  subject = "fe",
}: ExplanationCardProps) {
  const overallText = stripAnswerReferenceTail(explanation.overall)
  const overallExclude = priorGlossaryTerms ?? new Set<string>()
  const overallUsed = usedGlossaryTerms(overallText, overallExclude)

  const perChoiceExcludes: Set<string>[] = []
  let acc = new Set<string>([...overallExclude, ...overallUsed])
  for (const row of explanation.per_choice ?? []) {
    perChoiceExcludes.push(new Set(acc))
    const used = usedGlossaryTerms(row.text, acc)
    for (const t of used) acc.add(t)
  }

  return (
    <div className="bg-goukaku-surface rounded-[22px] p-[18px] border border-goukaku-divider mt-4">
      <div className="inline-flex items-center gap-1.5 bg-goukaku-cool/35 px-2.5 py-1.5 rounded-[18px]">
        <span className="text-[9px] tracking-[1.5px] font-extrabold text-[#5D8C00]">ANS</span>
        <span className="text-[14px] font-black text-goukaku-ink">{correctLabel ?? "-"}</span>
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
          <div className="h-px bg-goukaku-divider my-3.5" />
          {explanation.per_choice.map((row, idx) => (
            <div key={row.label} className="flex gap-2.5 py-2">
              <div className="w-[18px] font-extrabold text-goukaku-ink/50">{row.label}</div>
              <div className="text-[12px] leading-[1.6] text-goukaku-ink/75">
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
          <div className="h-px bg-goukaku-divider mt-3 mb-3" />
          <TagChips tags={tags} subject={subject} />
        </>
      )}
    </div>
  )
}
