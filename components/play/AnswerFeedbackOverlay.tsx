"use client"

import { useEffect, useState } from "react"

export type FeedbackKind = "correct" | "wrong"

export function AnswerFeedbackOverlay({
  trigger,
  kind,
}: {
  trigger: number
  kind: FeedbackKind | null
}) {
  const [visible, setVisible] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    if (trigger === 0 || kind === null) return
    queueMicrotask(() => {
      setVisible(true)
      setAnimateIn(false)
    })
    const showId = requestAnimationFrame(() => setAnimateIn(true))
    const fadeOutId = window.setTimeout(() => setAnimateIn(false), 600)
    const hideId = window.setTimeout(() => setVisible(false), 870)
    return () => {
      cancelAnimationFrame(showId)
      window.clearTimeout(fadeOutId)
      window.clearTimeout(hideId)
    }
  }, [trigger, kind])

  if (!visible || kind === null) return null

  const isCorrect = kind === "correct"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      aria-hidden
    >
      <div
        className={[
          "transition-all duration-[270ms] ease-out",
          animateIn ? "opacity-100 scale-100" : "opacity-0 scale-75",
        ].join(" ")}
      >
        <div
          className={[
            "w-40 h-40 rounded-full flex items-center justify-center",
            "border-[6px] backdrop-blur-sm",
            isCorrect
              ? "bg-goukaku-lime/80 border-goukaku-lime text-[#3D5C00]"
              : "bg-goukaku-pink/80 border-goukaku-pink-script text-goukaku-pink-script",
          ].join(" ")}
        >
          <span className="text-[88px] font-black leading-none -mt-2">
            {isCorrect ? "◯" : "✕"}
          </span>
        </div>
      </div>
    </div>
  )
}
