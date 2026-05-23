"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { isBookmarked, toggleBookmark } from "@/lib/local-store"

export function PlayTopBar({
  examTitle,
  qNumber,
  currentIndex,
  total,
  questionId,
  homeHref = "/fe",
}: {
  examTitle: string
  qNumber: number
  currentIndex: number
  total: number
  questionId?: string
  homeHref?: string
}) {
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (!questionId) return
    setBookmarked(isBookmarked(questionId))
  }, [questionId])

  const onToggle = () => {
    if (!questionId) return
    const next = toggleBookmark(questionId)
    setBookmarked(next)
  }

  return (
    <div className="flex items-center gap-2.5 py-2 mb-3">
      <Link
        href={homeHref}
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
      {questionId ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={bookmarked ? "ブックマーク解除" : "ブックマーク"}
          className="w-9 h-9 flex items-center justify-center text-[18px]"
        >
          {bookmarked ? (
            <span className="text-goukaku-pink-script">★</span>
          ) : (
            <span className="text-goukaku-ink/45">☆</span>
          )}
        </button>
      ) : null}
    </div>
  )
}
