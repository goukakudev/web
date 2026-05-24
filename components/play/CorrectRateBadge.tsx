import type { QuestionStat } from "@/lib/types"

export function CorrectRateBadge({ stat }: { stat: QuestionStat }) {
  if (stat.total === 0) return null
  const rate = (stat.correct / stat.total) * 100
  const totalFormatted = stat.total.toLocaleString("en-US")
  return (
    <div className="flex items-center gap-1.5 mt-2 mb-1 px-1">
      <span className="text-[11px] font-extrabold tracking-wide text-goukaku-ink/55">
        この問の正解率:
      </span>
      <span className="text-[12px] font-black tabular-nums text-goukaku-ink">
        {rate.toFixed(2)}%
      </span>
      <span className="text-[11px] font-extrabold tabular-nums text-goukaku-ink/45">
        ({totalFormatted}件)
      </span>
    </div>
  )
}
