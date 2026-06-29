"use client"

import { useEffect, useState } from "react"

type Pref = "auto" | "light" | "dark"

const STORAGE_KEY = "goukaku.theme"

function resolveDark(pref: Pref): boolean {
  if (pref === "dark") return true
  if (pref === "light") return false
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

const OPTIONS: { value: Pref; label: string }[] = [
  { value: "auto", label: "AUTO" },
  { value: "light", label: "LIGHT" },
  { value: "dark", label: "DARK" },
]

export function ScThemeToggle() {
  const [pref, setPref] = useState<Pref>("auto")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      const stored = (localStorage.getItem(STORAGE_KEY) as Pref | null) ?? "auto"
      setPref(stored)
      setMounted(true)
    })
  }, [])

  function apply(next: Pref) {
    setPref(next)
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.setAttribute(
      "data-theme",
      resolveDark(next) ? "dark" : "light",
    )
  }

  const active = mounted ? pref : "auto"

  return (
    <section className="sc-theme">
      <p className="sc-theme-label">THEME</p>
      <div role="radiogroup" aria-label="テーマ" className="sc-theme-row">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={opt.value === active}
            onClick={() => apply(opt.value)}
            className="sc-theme-btn"
            data-active={opt.value === active}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  )
}
