import type { ChoiceLabel } from "./types"

const KEY_DEVICE_ID = "examquiz.device_id.v1"
const KEY_ANSWERS = "examquiz.answers.v1"

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
