"use client"

import { MathText } from "./MathText"

export interface ChoiceRowProps {
  letter: string
  text: string
  isSelected: boolean
  isCorrect: boolean | undefined
  onClick: () => void
  variant?: "default" | "denki"
}

function styleFor(
  revealed: boolean,
  isCorrect: boolean | undefined,
  isSelected: boolean,
  variant: "default" | "denki",
): string {
  if (variant === "denki") {
    if (!revealed) {
      return isSelected
        ? "bg-[#fff8cf] border-[#191815] shadow-[2px_2px_0_#191815]"
        : "bg-[#fffdf6] border-[#d8d1bc] hover:border-[#191815]/60"
    }
    if (isCorrect && isSelected)
      return "bg-[#e6f7d7] border-[#2f7d32] border-2 ring-2 ring-[#2f7d32]/20"
    if (isCorrect) return "bg-[#f0fadf] border-[#2f7d32] border-2"
    if (isSelected)
      return "bg-[#ffe1d8] border-[#c7372f] border-2 ring-2 ring-[#c7372f]/20"
    return "bg-[#fffdf6] border-[#d8d1bc] opacity-55"
  }
  if (!revealed) {
    return isSelected
      ? "bg-goukaku-ink/5 border-goukaku-ink"
      : "bg-goukaku-surface border-goukaku-divider"
  }
  if (isCorrect && isSelected)
    return "bg-goukaku-lime/40 border-goukaku-lime border-[3px] ring-2 ring-goukaku-lime/40"
  if (isCorrect) return "bg-goukaku-lime/25 border-goukaku-lime"
  if (isSelected)
    return "bg-goukaku-pink/30 border-goukaku-pink-script border-[3px] ring-2 ring-goukaku-pink-script/40"
  return "bg-goukaku-surface border-goukaku-divider opacity-55"
}

export function ChoiceRow({
  letter,
  text,
  isSelected,
  isCorrect,
  onClick,
  variant = "default",
}: ChoiceRowProps) {
  const revealed = isCorrect !== undefined

  const bg = styleFor(revealed, isCorrect, isSelected, variant)
  const showCheck = revealed && isCorrect === true
  const showCross = revealed && isCorrect === false && isSelected
  const buttonShape =
    variant === "denki"
      ? "rounded-lg border-2 mb-2.5 shadow-sm"
      : "rounded-[18px] border mb-2"
  const letterCls =
    variant === "denki"
      ? [
          "grid size-8 shrink-0 place-items-center rounded-md border border-[#191815]/20 text-center font-black text-[13px]",
          revealed && isCorrect
            ? "bg-[#2f7d32] text-white"
            : showCross
              ? "bg-[#c7372f] text-white"
              : "bg-[#ffe25a] text-[#191815]",
        ].join(" ")
      : [
          "w-[26px] text-center font-extrabold text-[14px]",
          revealed && isCorrect
            ? "text-[#5D8C00]"
            : showCross
              ? "text-goukaku-pink-script"
              : "text-goukaku-ink/45",
        ].join(" ")

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={revealed}
      className={`w-full flex items-start gap-3 py-3 px-3.5 text-left transition ${buttonShape} ${bg}`}
    >
      <span className={letterCls}>
        {letter}
      </span>
      <span className="flex-1 text-[13px] font-semibold leading-relaxed">
        <MathText text={text} mathSize="sm" glossaryEnabled={false} />
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
