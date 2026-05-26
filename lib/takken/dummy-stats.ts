/**
 * 宅建士クイズ用ダミー統計データ生成器。
 *
 * 実際の集計データがまだ無いため、回答数・正解率・選択肢ごとの分布を
 * 試験年度 (合格率) と質問 ID から決定論的に生成する。実 API ができたら
 * page.tsx で本ファイルの呼び出しを差し替えるだけで切り替え可能。
 *
 * 数値の方針:
 * - 回答数: 古い試験ほど少なく、新しい試験ほど多い
 *   H16(2004) → 60〜100 件、R7(2025) → 800〜1,400 件
 * - 正解率: 試験年の合格率に比例して上下、各問題で ±20% ばらつき
 *   合格率 17% → 1問あたり平均 ~49% 程度
 */

import type { TakkenExam, TakkenQuestion } from "./api"

export type TakkenQuestionStat = {
  question_id: string
  total: number
  correct: number
  by_label: Record<string, number>
}

// 宅地建物取引士試験 過去合格率 (出典: 一般財団法人不動産適正取引推進機構公表値の概算)
const PASS_RATES_BY_YEAR: Record<number, number> = {
  2004: 0.173, 2005: 0.173, 2006: 0.171, 2007: 0.173, 2008: 0.162,
  2009: 0.179, 2010: 0.152, 2011: 0.161, 2012: 0.167, 2013: 0.153,
  2014: 0.175, 2015: 0.154, 2016: 0.154, 2017: 0.156, 2018: 0.156,
  2019: 0.170, 2020: 0.176, 2021: 0.179, 2022: 0.170, 2023: 0.172,
  2024: 0.186,
}
const DEFAULT_PASS_RATE = 0.170

function passRateFor(year: number): number {
  return PASS_RATES_BY_YEAR[year] ?? DEFAULT_PASS_RATE
}

// FNV-1a で seed → [0, 1)。salt で同じ seed から別系列を作れる。
function seeded(seed: string, salt = 0): number {
  let h = 2166136261 ^ salt
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  }
  return (h >>> 0) / 0xffffffff
}

function totalAnswersFor(qid: string, year: number): number {
  const t = Math.max(0, Math.min(1, (year - 2004) / 21))
  const min = Math.floor(60 + t * 740)
  const max = Math.floor(100 + t * 1300)
  const rand = seeded(qid, 1)
  return min + Math.floor(rand * (max - min + 1))
}

function correctRateFor(qid: string, year: number): number {
  const pass = passRateFor(year)
  const baseline = 0.22 + pass * 1.6
  const variance = (seeded(qid, 2) - 0.5) * 0.4
  return Math.max(0.12, Math.min(0.9, baseline + variance))
}

function buildByLabel(
  qid: string,
  total: number,
  correct: number,
  labels: string[],
  correctLabel: string,
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const l of labels) out[l] = 0
  out[correctLabel] = correct

  const wrong = labels.filter((l) => l !== correctLabel)
  if (wrong.length === 0) return out

  const weights = wrong.map((_, i) => seeded(qid, 10 + i) + 0.2)
  const sum = weights.reduce((a, b) => a + b, 0)
  let remaining = total - correct
  for (let i = 0; i < wrong.length; i++) {
    const isLast = i === wrong.length - 1
    const portion = isLast
      ? remaining
      : Math.floor((weights[i]! / sum) * (total - correct))
    out[wrong[i]!] = portion
    remaining -= portion
  }
  return out
}

export function generateTakkenStats(
  exam: TakkenExam,
  questions: TakkenQuestion[],
): Record<string, TakkenQuestionStat> {
  const result: Record<string, TakkenQuestionStat> = {}
  for (const q of questions) {
    const labels = Object.keys(q.choices).sort()
    const correctNum = q.accepted_answers[0]
    if (correctNum === undefined) continue
    const correctLabel = String(correctNum)

    const total = totalAnswersFor(q._id, exam.year)
    const correct = Math.round(total * correctRateFor(q._id, exam.year))

    result[q._id] = {
      question_id: q._id,
      total,
      correct,
      by_label: buildByLabel(q._id, total, correct, labels, correctLabel),
    }
  }
  return result
}
