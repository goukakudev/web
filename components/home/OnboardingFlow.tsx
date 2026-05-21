"use client"

import { useEffect, useState } from "react"
import { isOnboardingCompleted, markOnboardingCompleted } from "@/lib/local-store"

interface Page {
  scriptLabel: string
  title: string
  body: string
  emoji: string
  bg: string
}

const PAGES: Page[] = [
  {
    scriptLabel: "Step 1",
    title: "試験を選ぼう",
    body: "「学習カテゴリ」から、解きたい年度をタップします。\n例: 令和5年の科目A",
    emoji: "📚",
    bg: "bg-goukaku-lime",
  },
  {
    scriptLabel: "Step 2",
    title: "モードを選ぼう",
    body: "「順番に解く」または「ランダム」をタップ。\nまずは通常モードがおすすめです。",
    emoji: "🔢",
    bg: "bg-goukaku-cool",
  },
  {
    scriptLabel: "Step 3",
    title: "問題を読んで答えよう",
    body: "問題文を読み、ア・イ・ウ・エから正しいと思う選択肢をタップ。\n問題ごとにブックマークもできます。",
    emoji: "👆",
    bg: "bg-goukaku-pink-script/30",
  },
]

export function OnboardingFlow() {
  const [active, setActive] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    if (!isOnboardingCompleted()) setActive(true)
  }, [])

  if (!active) return null

  const complete = () => {
    markOnboardingCompleted()
    setActive(false)
  }

  const isLast = pageIndex === PAGES.length - 1
  const current = PAGES[pageIndex]

  return (
    <div
      className="fixed inset-0 z-[60] bg-goukaku-bg flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex justify-end px-5 pt-4">
        <button
          type="button"
          onClick={complete}
          className="text-[13px] font-extrabold opacity-55 px-3 py-2"
        >
          スキップ
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-7">
        <div
          className={`w-[200px] h-[200px] rounded-full flex items-center justify-center text-[80px] ${current.bg}`}
        >
          <span>{current.emoji}</span>
        </div>
        <div>
          <div
            className="text-[26px] leading-none text-goukaku-pink-script mb-2"
            style={{ fontFamily: "var(--font-script)" }}
          >
            {current.scriptLabel}
          </div>
          <h2 className="text-[22px] font-extrabold">{current.title}</h2>
          <p className="mt-3 text-[14px] leading-relaxed opacity-75 whitespace-pre-line">
            {current.body}
          </p>
        </div>
      </div>
      <div className="px-6 pb-7">
        <div className="flex items-center justify-center gap-2 mb-4">
          {PAGES.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === pageIndex ? "bg-goukaku-pink-script w-6" : "bg-goukaku-divider w-2"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {pageIndex > 0 ? (
            <button
              type="button"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              className="flex-1 h-[48px] rounded-full bg-goukaku-surface border border-goukaku-divider font-extrabold text-[13px]"
            >
              戻る
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (isLast) complete()
              else setPageIndex((p) => Math.min(PAGES.length - 1, p + 1))
            }}
            className="flex-1 h-[48px] rounded-full bg-goukaku-pink-script text-white font-extrabold text-[13px]"
          >
            {isLast ? "はじめる" : "次へ →"}
          </button>
        </div>
      </div>
    </div>
  )
}
