"use client"
import { useState, useEffect } from "react"
import { randomPhrase } from "@/lib/welcome-phrases"

const DEFAULT_PHRASE = "学べる時こそ最高 ☕"

export function TopBar() {
  const [phrase, setPhrase] = useState<string>(DEFAULT_PHRASE)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random phrase must run after hydration to keep SSR deterministic
    setPhrase(randomPhrase())
  }, [])
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
      <div className="w-[42px] h-[42px] rounded-full bg-goukaku-cool flex items-center justify-center text-[18px]">
        📊
      </div>
    </div>
  )
}
