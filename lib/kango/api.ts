// 看護 (/v1/kn) のサーバー側 API クライアント。lib/api-client.ts と同パターン (ISR fetch)。
// 宅建が lib/takken/api.ts として独立しているのに倣い、看護も self-contained にする。
import type {
  KangoExamSummary,
  KangoQuestion,
  KangoExamListResponse,
  KangoQuestionListResponse,
} from "./types"
import { roundNumber } from "./exam"

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
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      headers: { "X-API-Key": apiKey(), Accept: "application/json" },
      next: { revalidate },
    })
    if (!res.ok) throw new Error(`API ${res.status} on GET ${path}`)
    return (await res.json()) as T
  } catch (err) {
    // Build-time API unreachability falls back to empty so SSG defers to runtime
    // ISR. Gated to the build phase only. See lib/api-client.ts get() for details.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn(`[build] exam API unreachable on GET ${path}; deferring to runtime ISR`)
      return { exams: [], questions: [], tags: [], stats: [] } as unknown as T
    }
    throw err
  }
}

/** 全試験。API は自然順で返すため、回(降順)→午前午後 で安定ソートして返す。 */
export async function listKnExams(): Promise<KangoExamSummary[]> {
  const data = await get<KangoExamListResponse>("/v1/kn/exams", EXAMS_REVALIDATE)
  return data.exams.slice().sort((a, b) => {
    const d = roundNumber(b.exam_id) - roundNumber(a.exam_id)
    return d !== 0 ? d : (a.session ?? "").localeCompare(b.session ?? "")
  })
}

export async function listKnQuestions(examId: string): Promise<KangoQuestion[]> {
  const data = await get<KangoQuestionListResponse>(
    `/v1/kn/exams/${encodeURIComponent(examId)}/questions`,
    QUESTIONS_REVALIDATE,
  )
  return data.questions
}

export async function getKnExam(
  examId: string,
): Promise<KangoExamSummary | undefined> {
  const exams = await listKnExams()
  return exams.find((e) => e.exam_id === examId)
}

/** 全試験の問題を集約 (カテゴリ/タグ横断ページ用)。各 listKnQuestions は ISR キャッシュされる。 */
export async function listAllKnQuestions(): Promise<KangoQuestion[]> {
  const exams = await listKnExams()
  const lists = await Promise.all(exams.map((e) => listKnQuestions(e.exam_id)))
  return lists.flat()
}
