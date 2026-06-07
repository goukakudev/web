"use client"

import { useEffect, useState } from "react"
import { ScDonut } from "./ScChrome"
import { getAllAnswers } from "@/lib/local-store"

interface HeroData {
  pct: number
  streakDays: number
  totalSolved: number
  weeklySolved: number
  last7: number[]
}

function emptyHero(): HeroData {
  return { pct: 0, streakDays: 0, totalSolved: 0, weeklySolved: 0, last7: [0, 0, 0, 0, 0, 0, 0] }
}

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function computeHero(prefix: string): HeroData {
  const map = getAllAnswers()
  let solved = 0
  let correct = 0
  const dayHits = new Set<number>()
  const todayStart = startOfDay(new Date())
  const last7Counts: number[] = Array(7).fill(0)

  for (const rec of Object.values(map)) {
    if (!rec.exam_id.startsWith(prefix)) continue
    solved += 1
    if (rec.correct_label && rec.correct_label === rec.selected_label) correct += 1
    const ts = Date.parse(rec.answered_at)
    if (Number.isNaN(ts)) continue
    const dayKey = startOfDay(new Date(ts))
    dayHits.add(dayKey)
    const diffDays = Math.floor((todayStart - dayKey) / DAY_MS)
    if (diffDays >= 0 && diffDays < 7) {
      last7Counts[6 - diffDays] += 1
    }
  }

  // streak: 今日から遡って連続で記録のある日数
  let streakDays = 0
  let cursor = todayStart
  while (dayHits.has(cursor)) {
    streakDays += 1
    cursor -= DAY_MS
  }
  // 今日に記録が無くても昨日まで連続なら 0 とせず昨日からカウントする ios アプリ仕様
  if (streakDays === 0) {
    cursor = todayStart - DAY_MS
    while (dayHits.has(cursor)) {
      streakDays += 1
      cursor -= DAY_MS
    }
  }

  const pct = solved > 0 ? Math.round((correct / solved) * 100) : 0
  const weeklySolved = last7Counts.reduce((a, b) => a + b, 0)
  return { pct, streakDays, totalSolved: solved, weeklySolved, last7: last7Counts }
}

export function ScHero() {
  const [data, setData] = useState<HeroData>(emptyHero)
  useEffect(() => {
    setData(computeHero("sc-"))
  }, [])
  const maxSpark = Math.max(1, ...data.last7)
  return (
    <section className="sc-hero" aria-label="あなたの学習状況">
      <div className="sc-hero-row">
        <div className="sc-hero-donut">
          <ScDonut pct={data.pct} />
        </div>
        <div className="sc-hero-stats">
          <Stat
            tint="var(--color-sc-good)"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M13.5 0c-.4 5 1.5 7 2.5 8.5 1 1.5 2 3 2 5 0 4-3.6 8-7.6 8-2.7 0-5.4-1.5-6.4-4 .5.2 1.5.3 2.5 0-2-1-3.5-3-3.5-5.5 0-1.6.7-3 1.6-4.2.8 1.2 2 2 3.4 2.2-1-3 .5-6 5.5-10z" />
              </svg>
            }
            value={data.streakDays}
            unit="日連続"
            label="学習継続日数"
          />
          <span className="sc-hairline" />
          <Stat
            tint="var(--color-sc-primary)"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.4" fill="currentColor" />
              </svg>
            }
            value={data.totalSolved}
            unit="問"
            label="解いた問題数"
          />
          <span className="sc-hairline" />
          <Stat
            tint="var(--color-sc-primary)"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            }
            value={data.weeklySolved}
            unit="問"
            label="今週の演習数"
          />
        </div>
      </div>
      <div className="sc-hero-spark" aria-label="直近 7 日間の演習数">
        <div className="sc-hero-spark-head">
          <span className="sc-hero-spark-label">直近 7 日間の演習数</span>
          <span className="sc-hero-spark-total">計 {data.weeklySolved}</span>
        </div>
        <div className="sc-hero-spark-bars" role="img" aria-hidden>
          {data.last7.map((v, i) => (
            <span key={i} className="sc-hero-spark-bar">
              <i style={{ height: `${(v / maxSpark) * 100}%` }} />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stat({
  tint,
  icon,
  value,
  unit,
  label,
}: {
  tint: string
  icon: React.ReactNode
  value: number
  unit: string
  label: string
}) {
  return (
    <div className="sc-hero-stat">
      <div className="sc-hero-stat-icon" style={{ color: tint }}>
        {icon}
      </div>
      <div className="sc-hero-stat-body">
        <div className="sc-hero-stat-row">
          <span className="sc-hero-stat-value">{value}</span>
          <span className="sc-hero-stat-unit">{unit}</span>
        </div>
        <div className="sc-hero-stat-key">{label}</div>
      </div>
    </div>
  )
}
