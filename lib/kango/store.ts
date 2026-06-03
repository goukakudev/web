// 看護の端末ローカル学習記録 (localStorage)。iOS ProgressStore / BookmarkStore を移植。
// 既存 IPA の lib/local-store は ChoiceLabel(ア/イ/ウ/エ) 前提のため看護では別ストアにする。
// device_id だけは既存 examquiz.device_id.v1 を共有する。
import { getDeviceId } from "../local-store"

export { getDeviceId }

export interface KangoAnswerRecord {
  question_id: string
  exam_id: string
  q_number: number
  selected_label: string
  correct_label: string
  is_correct: boolean
  skipped: boolean
  answered_at: string // ISO timestamp
}

const KEY_ANSWERS = "kango.answers.v1"
const KEY_BOOKMARKS = "kango.bookmarks.v1"
const MAX_RECORDS = 5000

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function readRecords(): KangoAnswerRecord[] {
  if (!isBrowser()) return []
  try {
    return JSON.parse(localStorage.getItem(KEY_ANSWERS) ?? "[]") as KangoAnswerRecord[]
  } catch {
    return []
  }
}

function writeRecords(recs: KangoAnswerRecord[]): void {
  if (!isBrowser()) return
  localStorage.setItem(KEY_ANSWERS, JSON.stringify(recs.slice(-MAX_RECORDS)))
}

export function recordKangoAnswer(rec: KangoAnswerRecord): void {
  const recs = readRecords()
  recs.push(rec)
  writeRecords(recs)
  // stats 集計用に best-effort でサーバーへ送信 (失敗は無視。iOS ProgressStore.record と同様)
  if (isBrowser()) {
    void fetch("/api/kn/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: getDeviceId(),
        question_id: rec.question_id,
        exam_id: rec.exam_id,
        selected_label: rec.selected_label,
        correct_label: rec.correct_label,
        is_correct: rec.is_correct,
        skipped: rec.skipped,
        client_ts: rec.answered_at,
        // 看護は元ラベルで送信(選択肢シャッフルは表示順のみ)。
        // getExamStats は label_space="original" のログのみ集計するため必須。
        label_space: "original",
      }),
    }).catch(() => {})
  }
}

export function allKangoRecords(): KangoAnswerRecord[] {
  return readRecords()
}

export interface KangoSummary {
  answered: number
  correct: number
  accuracyPercent: number
  wrongQuestionIds: string[]
  correctByQuestion: Record<string, boolean>
  currentStreak: number
  studyDays: number
  todayCount: number
}

// ローカル年月日キー (UTC の slice だと日本時間とズレるため Date 経由でローカル日)
function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** records を1回走査して集計 (iOS ProgressStore.recompute 相当)。 */
export function kangoSummary(): KangoSummary {
  const recs = readRecords()
  const latest = new Map<string, KangoAnswerRecord>()
  for (const r of recs) {
    if (r.skipped) continue
    const cur = latest.get(r.question_id)
    if (cur && cur.answered_at > r.answered_at) continue
    latest.set(r.question_id, r)
  }
  const correctByQuestion: Record<string, boolean> = {}
  let correct = 0
  const wrong: KangoAnswerRecord[] = []
  for (const r of latest.values()) {
    correctByQuestion[r.question_id] = r.is_correct
    if (r.is_correct) correct++
    else wrong.push(r)
  }
  wrong.sort((a, b) => (a.answered_at > b.answered_at ? -1 : 1))

  let streak = 0
  for (let i = recs.length - 1; i >= 0; i--) {
    if (recs[i].skipped) continue
    if (recs[i].is_correct) streak++
    else break
  }

  const today = dayKey(new Date().toISOString())
  const days = new Set<string>()
  const todayQ = new Set<string>()
  for (const r of recs) {
    const k = dayKey(r.answered_at)
    days.add(k)
    if (k === today && !r.skipped) todayQ.add(r.question_id)
  }

  const answered = latest.size
  return {
    answered,
    correct,
    accuracyPercent: answered === 0 ? 0 : Math.round((correct / answered) * 100),
    wrongQuestionIds: wrong.map((r) => r.question_id),
    correctByQuestion,
    currentStreak: streak,
    studyDays: days.size,
    todayCount: todayQ.size,
  }
}

/** 試験ごとの解答数・正解数 (記録画面の試験別内訳用)。 */
export function kangoExamBreakdown(): Record<string, { answered: number; correct: number }> {
  const recs = readRecords()
  const latest = new Map<string, KangoAnswerRecord>()
  for (const r of recs) {
    if (r.skipped) continue
    const cur = latest.get(r.question_id)
    if (cur && cur.answered_at > r.answered_at) continue
    latest.set(r.question_id, r)
  }
  const out: Record<string, { answered: number; correct: number }> = {}
  for (const r of latest.values()) {
    const e = out[r.exam_id] ?? { answered: 0, correct: 0 }
    e.answered++
    if (r.is_correct) e.correct++
    out[r.exam_id] = e
  }
  return out
}

// ----- お気に入り -----

function readBookmarks(): Set<string> {
  if (!isBrowser()) return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY_BOOKMARKS) ?? "[]") as string[])
  } catch {
    return new Set()
  }
}

function writeBookmarks(s: Set<string>): void {
  if (!isBrowser()) return
  localStorage.setItem(KEY_BOOKMARKS, JSON.stringify([...s]))
}

export function kangoBookmarks(): Set<string> {
  return readBookmarks()
}

export function isKangoBookmarked(id: string): boolean {
  return readBookmarks().has(id)
}

export function toggleKangoBookmark(id: string): boolean {
  const s = readBookmarks()
  let on: boolean
  if (s.has(id)) {
    s.delete(id)
    on = false
  } else {
    s.add(id)
    on = true
  }
  writeBookmarks(s)
  return on
}
