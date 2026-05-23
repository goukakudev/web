import type {
  ExamSummary,
  Question,
  ExamListResponse,
  QuestionListResponse,
  PopularTag,
  PopularTagListResponse,
} from "./types"

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

export async function listExams(): Promise<ExamSummary[]> {
  const data = await get<ExamListResponse>("/v1/exams", EXAMS_REVALIDATE)
  return data.exams
}

export async function listQuestions(examId: string): Promise<Question[]> {
  const data = await get<QuestionListResponse>(
    `/v1/exams/${encodeURIComponent(examId)}/questions`,
    QUESTIONS_REVALIDATE,
  )
  return data.questions
}

export async function listPopularTags(limit = 20): Promise<PopularTag[]> {
  const data = await get<PopularTagListResponse>(
    `/v1/tags/popular?limit=${limit}`,
    EXAMS_REVALIDATE,
  )
  return data.tags
}

export async function listIpExams(): Promise<ExamSummary[]> {
  const data = await get<ExamListResponse>("/v1/ip/exams", EXAMS_REVALIDATE)
  return data.exams
}

export async function listIpQuestions(examId: string): Promise<Question[]> {
  const data = await get<QuestionListResponse>(
    `/v1/ip/exams/${encodeURIComponent(examId)}/questions`,
    QUESTIONS_REVALIDATE,
  )
  return data.questions
}
