import type { ChoiceLabel } from "./types"

const KEY_DEVICE_ID = "examquiz.device_id.v1"
const KEY_ANSWERS = "examquiz.answers.v1"
const KEY_BOOKMARKS = "examquiz.bookmarks.v1"
const KEY_ONBOARDING_DONE = "examquiz.onboarding.completed.v1"

export interface AnswerRecord {
  question_id: string
  exam_id: string
  selected_label: ChoiceLabel
  correct_label?: ChoiceLabel
  answered_at: string // ISO timestamp
}

type AnswerMap = Record<string, AnswerRecord>

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function readMap(): AnswerMap {
  if (!isBrowser()) return {}
  const raw = localStorage.getItem(KEY_ANSWERS)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as AnswerMap
  } catch {
    return {}
  }
}

function writeMap(map: AnswerMap): void {
  if (!isBrowser()) return
  localStorage.setItem(KEY_ANSWERS, JSON.stringify(map))
}

export function getDeviceId(): string {
  if (!isBrowser()) return ""
  const existing = localStorage.getItem(KEY_DEVICE_ID)
  if (existing) return existing
  const fresh = crypto.randomUUID()
  localStorage.setItem(KEY_DEVICE_ID, fresh)
  return fresh
}

export function setAnswer(rec: AnswerRecord): void {
  const map = readMap()
  map[rec.question_id] = rec
  writeMap(map)
}

export function getAnswer(questionId: string): AnswerRecord | undefined {
  return readMap()[questionId]
}

export function getAllAnswers(): AnswerMap {
  return readMap()
}

export function resetExamProgress(examId: string): void {
  const map = readMap()
  for (const qid of Object.keys(map)) {
    if (map[qid].exam_id === examId) delete map[qid]
  }
  writeMap(map)
}

export interface ExamStats {
  answered: number
  correct: number
  total: number
}

export function getExamStats(examId: string, total: number): ExamStats {
  const map = readMap()
  let answered = 0
  let correct = 0
  for (const rec of Object.values(map)) {
    if (rec.exam_id !== examId) continue
    answered += 1
    if (rec.correct_label && rec.correct_label === rec.selected_label) {
      correct += 1
    }
  }
  return { answered, correct, total }
}

// ----- Bookmarks -----

function readBookmarks(): Set<string> {
  if (!isBrowser()) return new Set()
  const raw = localStorage.getItem(KEY_BOOKMARKS)
  if (!raw) return new Set()
  try {
    const arr = JSON.parse(raw) as string[]
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function writeBookmarks(set: Set<string>): void {
  if (!isBrowser()) return
  localStorage.setItem(KEY_BOOKMARKS, JSON.stringify([...set]))
}

export function getBookmarks(): Set<string> {
  return readBookmarks()
}

export function isBookmarked(questionId: string): boolean {
  return readBookmarks().has(questionId)
}

export function toggleBookmark(questionId: string): boolean {
  const set = readBookmarks()
  let nowOn: boolean
  if (set.has(questionId)) {
    set.delete(questionId)
    nowOn = false
  } else {
    set.add(questionId)
    nowOn = true
  }
  writeBookmarks(set)
  return nowOn
}

export function countBookmarksForExam(examId: string): number {
  // Bookmarks are keyed by `${examId}-Q...`. Count the prefix matches.
  const set = readBookmarks()
  let n = 0
  for (const id of set) {
    if (id.startsWith(`${examId}-`)) n += 1
  }
  return n
}

// ----- Onboarding -----

export function isOnboardingCompleted(): boolean {
  if (!isBrowser()) return true // SSR: never block render with onboarding
  return localStorage.getItem(KEY_ONBOARDING_DONE) === "1"
}

export function markOnboardingCompleted(): void {
  if (!isBrowser()) return
  localStorage.setItem(KEY_ONBOARDING_DONE, "1")
}
