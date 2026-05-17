"use client"

export interface ChoiceRowProps {
  letter: string
  text: string
  isSelected: boolean
  isCorrect: boolean | undefined
  onClick: () => void
}

export function ChoiceRow({ letter, text, isSelected, isCorrect, onClick }: ChoiceRowProps) {
  const revealed = isCorrect !== undefined

  const bg = revealed
    ? isCorrect
      ? "bg-goukaku-lime/25 border-goukaku-lime"
      : "bg-goukaku-surface border-goukaku-ink/35"
    : isSelected
      ? "bg-goukaku-ink/5 border-goukaku-ink"
      : "bg-goukaku-surface border-goukaku-divider"

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
          revealed && isCorrect ? "text-[#5D8C00]" : "text-goukaku-ink/45",
        ].join(" ")}
      >
        {letter}
      </span>
      <span className="flex-1 text-[13px] font-semibold leading-relaxed">{text}</span>
      <span
        data-testid="status-slot"
        className="w-[22px] h-[22px] flex items-center justify-center text-[16px]"
      >
        {revealed ? (isCorrect ? "✓" : "✕") : ""}
      </span>
    </button>
  )
}
