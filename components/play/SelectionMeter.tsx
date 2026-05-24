"use client"

import { useEffect, useState } from "react"

export function SelectionMeter({
  rate,
  isCorrect,
  revealed,
}: {
  rate: number
  isCorrect: boolean
  revealed: boolean
}) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!revealed) {
      setWidth(0)
      return
    }
    const id = requestAnimationFrame(() => {
      setWidth(Math.min(100, Math.max(0, rate)))
    })
    return () => cancelAnimationFrame(id)
  }, [revealed, rate])

  const barColor = isCorrect ? "bg-goukaku-lime" : "bg-goukaku-ink/35"
  const textColor = isCorrect ? "text-goukaku-ink" : "text-goukaku-ink/55"

  return (
    <div className="flex items-center gap-2 px-3.5 -mt-1 mb-1.5">
      <div className="h-1.5 flex-1 rounded-full bg-goukaku-divider/30 overflow-hidden">
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
