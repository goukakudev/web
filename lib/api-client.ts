import type { ExamSummary, Question, ExamListResponse, QuestionListResponse } from "./types"

const EXAMS_REVALIDATE = 60 * 60 // 1h
const QUESTIONS_REVALIDATE = 60 * 60 * 24 // 24h

function baseUrl(): string {
  const v = process.env.API_BASE
  if (!v) throw new Error("API_BASE env var not set")
  return v.replace(/\/+$/, "")
}

function apiKey(): string {
  const v = process.env.API_KEY
  if (!v) throw new Error("API_KEY env var not set")
  return v
}

async function get<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    headers: { "X-API-Key": apiKey(), Accept: "application/json" },
    next: { revalidate },
  })
  if (!res.ok) {
    throw new Error(`API ${res.status} on GET ${path}`)
  }
  return (await res.json()) as T
}

function examSortKey(examId: string): [number, number] {
  // fe-YYYY[hr]NN[ah]?-a → 西暦年 + 季節 (autumn=2, spring=1, 単発=2)
  const m = examId.match(/^fe-(\d{4})[hr]\d{2}([ah])?/)
  if (!m) return [0, 0]
  const year = parseInt(m[1], 10)
  const season = m[2] === "h" ? 1 : 2
  return [year, season]
}

export async function listExams(): Promise<ExamSummary[]> {
  const data = await get<ExamListResponse>("/v1/exams", EXAMS_REVALIDATE)
  return [...data.exams].sort((a, b) => {
    const [ya, sa] = examSortKey(a.exam_id)
    const [yb, sb] = examSortKey(b.exam_id)
    if (yb !== ya) return yb - ya
    return sb - sa
  })
}

export async function listQuestions(examId: string): Promise<Question[]> {
  const data = await get<QuestionListResponse>(
    `/v1/exams/${encodeURIComponent(examId)}/questions`,
    QUESTIONS_REVALIDATE,
  )
  return data.questions
}
