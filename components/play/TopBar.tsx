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
  displayQNumber,
  progressText,
  sourceLabel,
  variant = "default",
}: {
  examTitle: string
  qNumber: number
  currentIndex: number
  total: number
  questionId?: string
  homeHref?: string
  displayQNumber?: number
  progressText?: string
  sourceLabel?: string
  variant?: "default" | "denki"
}) {
  const [bookmarked, setBookmarked] = useState(false)
  const shownQNumber = displayQNumber ?? qNumber
  const shownProgress = progressText ?? `${currentIndex + 1} / ${total}`

  useEffect(() => {
    if (!questionId) return
    queueMicrotask(() => setBookmarked(isBookmarked(questionId)))
  }, [questionId])

  const onToggle = () => {
    if (!questionId) return
    const next = toggleBookmark(questionId)
    setBookmarked(next)
  }

  const rootCls =
    variant === "denki"
      ? "mb-4 flex items-center gap-3 rounded-lg border-2 border-[#191815] bg-[#fffdf6] px-3 py-3 shadow-[4px_4px_0_#191815]"
      : "flex items-center gap-2.5 py-2 mb-3"
  const backCls =
    variant === "denki"
      ? "flex size-10 items-center justify-center rounded-lg border-2 border-[#191815] bg-[#ffe25a] text-[16px] font-black shadow-[2px_2px_0_#191815]"
      : "w-9 h-9 rounded-full bg-goukaku-surface shadow-sm flex items-center justify-center text-[16px]"
  const titleCls =
    variant === "denki"
      ? "text-[10px] tracking-[1.2px] font-black text-[#007c83] uppercase"
      : "text-[10px] tracking-[1.2px] font-bold text-goukaku-ink/55 uppercase"
  const progressCls =
    variant === "denki"
      ? "ml-2 text-[11px] text-[#6c6252] font-black"
      : "ml-2 text-[11px] text-goukaku-ink/55 font-bold"
  const sourceCls =
    variant === "denki"
      ? "mt-0.5 text-[10px] font-bold text-[#6c6252]"
      : "mt-0.5 text-[10px] font-bold text-goukaku-ink/45"
  const bookmarkCls =
    variant === "denki"
      ? "flex size-10 items-center justify-center rounded-lg border border-[#191815]/20 bg-[#f5f2e8] text-[18px]"
      : "w-9 h-9 flex items-center justify-center text-[18px]"

  return (
    <div className={rootCls}>
      <Link
        href={homeHref}
        aria-label="試験トップへ戻る"
        className={backCls}
      >
        ←
      </Link>
      <div className="flex-1">
        <div className={titleCls}>
          {examTitle}
        </div>
        <div className="text-[14px] font-extrabold">
          Q {shownQNumber}
          <span className={progressCls}>
            {shownProgress}
          </span>
        </div>
        {sourceLabel ? (
          <div className={sourceCls}>
            {sourceLabel}
          </div>
        ) : null}
      </div>
      {questionId ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={bookmarked ? "ブックマーク解除" : "ブックマーク"}
          className={bookmarkCls}
        >
          {bookmarked ? (
            <span className={variant === "denki" ? "text-[#c7372f]" : "text-goukaku-pink-script"}>★</span>
          ) : (
            <span className={variant === "denki" ? "text-[#6c6252]" : "text-goukaku-ink/45"}>☆</span>
          )}
        </button>
      ) : null}
    </div>
  )
}
