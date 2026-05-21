"use client"
import { useState, useEffect } from "react"
import { randomPhrase } from "@/lib/welcome-phrases"
import { getAllAnswers } from "@/lib/local-store"
import { StudyDaysModal } from "./StudyDaysModal"

const DEFAULT_PHRASE = "学べる時こそ最高 ☕"

export function TopBar() {
  const [phrase, setPhrase] = useState<string>(DEFAULT_PHRASE)
  const [streak, setStreak] = useState<number>(0)
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random phrase must run after hydration to keep SSR deterministic
    setPhrase(randomPhrase())
    setStreak(computeStreak())
    setHydrated(true)
  }, [])

  // Recompute streak whenever modal closes (user may have answered new questions)
  useEffect(() => {
    if (!hydrated) return
    if (open) return
    setStreak(computeStreak())
  }, [open, hydrated])

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div
          className="text-[22px] leading-none text-goukaku-pink-script"
          style={{ fontFamily: "var(--font-script)" }}
        >
          Good morning,
        </div>
        <div className="mt-1 text-[22px] font-extrabold tracking-tight max-w-[240px] leading-tight">
          {phrase}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {streak > 0 ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`学習ストリーク ${streak} 日連続。タップで学習履歴`}
            className="flex items-center gap-1 px-2.5 h-[34px] rounded-full bg-goukaku-surface border border-goukaku-divider text-[13px] font-extrabold"
          >
            <span className="text-goukaku-pink-script">📅</span>
            <span className="tabular-nums">{streak}</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="学習履歴"
          className="w-[42px] h-[42px] rounded-full bg-goukaku-cool flex items-center justify-center text-[18px]"
        >
          📊
        </button>
      </div>
      <StudyDaysModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function computeStreak(): number {
  if (typeof window === "undefined") return 0
  const map = getAllAnswers()
  if (Object.keys(map).length === 0) return 0
  const days = new Set<string>()
  for (const r of Object.values(map)) {
    const d = new Date(r.answered_at)
    days.add(toDayKey(d))
  }
  const today = new Date()
  let cursor = new Date(today)
  if (!days.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(toDayKey(cursor))) return 0
  }
  let streak = 0
  while (days.has(toDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function toDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

