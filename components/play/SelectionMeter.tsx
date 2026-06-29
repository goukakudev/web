"use client"

import { useEffect, useState } from "react"

export function SelectionMeter({
  rate,
  isCorrect,
  revealed,
  variant = "default",
}: {
  rate: number
  isCorrect: boolean
  revealed: boolean
  variant?: "default" | "denki"
}) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const nextWidth = revealed ? Math.min(100, Math.max(0, rate)) : 0
    const id = requestAnimationFrame(() => {
      setWidth(nextWidth)
    })
    return () => cancelAnimationFrame(id)
  }, [revealed, rate])

  const barColor =
    variant === "denki"
      ? isCorrect ? "bg-[#2f7d32]" : "bg-[#191815]/35"
      : isCorrect ? "bg-goukaku-lime" : "bg-goukaku-ink/35"
  const textColor =
    variant === "denki"
      ? isCorrect ? "text-[#191815]" : "text-[#6c6252]"
      : isCorrect ? "text-goukaku-ink" : "text-goukaku-ink/55"
  const trackColor = variant === "denki" ? "bg-[#d8d1bc]/55" : "bg-goukaku-divider/30"

  return (
    <div className="flex items-center gap-2 px-3.5 -mt-1 mb-1.5">
      <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${trackColor}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-[800ms] ease-out ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={`text-[11px] font-extrabold tabular-nums w-14 text-right ${textColor}`}
      >
        {rate.toFixed(2)}%
      </span>
    </div>
  )
}
