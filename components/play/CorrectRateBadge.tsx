import type { QuestionStat } from "@/lib/types"

export function CorrectRateBadge({
  stat,
  variant = "default",
}: {
  stat: QuestionStat
  variant?: "default" | "denki"
}) {
  if (stat.total === 0) return null
  const rate = (stat.correct / stat.total) * 100
  const totalFormatted = stat.total.toLocaleString("en-US")
  const labelCls =
    variant === "denki"
      ? "text-[11px] font-extrabold tracking-wide text-[#6c6252]"
      : "text-[11px] font-extrabold tracking-wide text-goukaku-ink/55"
  const valueCls =
    variant === "denki"
      ? "text-[12px] font-black tabular-nums text-[#191815]"
      : "text-[12px] font-black tabular-nums text-goukaku-ink"
  const totalCls =
    variant === "denki"
      ? "text-[11px] font-extrabold tabular-nums text-[#6c6252]"
      : "text-[11px] font-extrabold tabular-nums text-goukaku-ink/45"

  return (
    <div className="flex items-center gap-1.5 mt-2 mb-1 px-1">
      <span className={labelCls}>
        この問の正解率:
      </span>
      <span className={valueCls}>
        {rate.toFixed(2)}%
      </span>
      <span className={totalCls}>
        ({totalFormatted}件)
      </span>
    </div>
  )
}
