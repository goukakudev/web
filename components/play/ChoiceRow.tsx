"use client"

import { MathText } from "./MathText"

export interface ChoiceRowProps {
  letter: string
  text: string
  isSelected: boolean
  isCorrect: boolean | undefined
  onClick: () => void
}

function styleFor(
  revealed: boolean,
  isCorrect: boolean | undefined,
  isSelected: boolean,
): string {
  if (!revealed) {
    return isSelected
      ? "bg-goukaku-ink/5 border-goukaku-ink"
      : "bg-goukaku-surface border-goukaku-divider"
  }
  if (isCorrect) return "bg-goukaku-lime/25 border-goukaku-lime"
  if (isSelected) return "bg-goukaku-pink/15 border-goukaku-pink-script border-2"
  return "bg-goukaku-surface border-goukaku-divider opacity-55"
}

export function ChoiceRow({ letter, text, isSelected, isCorrect, onClick }: ChoiceRowProps) {
  const revealed = isCorrect !== undefined

  const bg = styleFor(revealed, isCorrect, isSelected)
  const showCheck = revealed && isCorrect === true
  const showCross = revealed && isCorrect === false && isSelected

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={revealed}
      className={`w-full flex items-start gap-3 py-3 px-3.5 rounded-[18px] border mb-2 text-left ${bg}`}
    >
      <span
        className={[
          "w-[26px] text-center font-extrabold text-[14px]",
          revealed && isCorrect
            ? "text-[#5D8C00]"
            : showCross
              ? "text-goukaku-pink-script"
              : "text-goukaku-ink/45",
        ].join(" ")}
      >
        {letter}
      </span>
      <span className="flex-1 text-[13px] font-semibold leading-relaxed">
        <MathText text={text} mathSize="sm" />
      </span>
      <span
        data-testid="status-slot"
        className="w-[22px] h-[22px] flex items-center justify-center text-[16px]"
      >
        {showCheck ? "✓" : showCross ? "✕" : ""}
      </span>
    </button>
  )
}
