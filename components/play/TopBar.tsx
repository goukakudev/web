"use client"
import Link from "next/link"

export function PlayTopBar({
  examTitle,
  qNumber,
  currentIndex,
  total,
}: {
  examTitle: string
  qNumber: number
  currentIndex: number
  total: number
}) {
  return (
    <div className="flex items-center gap-2.5 py-2 mb-3">
      <Link
        href="/"
        className="w-9 h-9 rounded-full bg-goukaku-surface shadow-sm flex items-center justify-center text-[16px]"
      >
        ←
      </Link>
      <div className="flex-1">
        <div className="text-[10px] tracking-[1.2px] font-bold text-goukaku-ink/55 uppercase">
          {examTitle}
        </div>
        <div className="text-[14px] font-extrabold">
          Q {qNumber}
          <span className="ml-2 text-[11px] text-goukaku-ink/55 font-bold">
            {currentIndex + 1} / {total}
          </span>
        </div>
      </div>
    </div>
  )
}
