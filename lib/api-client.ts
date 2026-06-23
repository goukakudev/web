import type {
  ExamSummary,
  Question,
  ExamListResponse,
  QuestionListResponse,
  PopularTag,
  PopularTagListResponse,
  QuestionStat,
  ExamStatsResponse,
} from "./types"

const EXAMS_REVALIDATE = 60 * 60 // 1h
const QUESTIONS_REVALIDATE = 60 * 60 * 24 // 24h
const STATS_REVALIDATE = 60 * 60 // 1h

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

function normalizeQuestionTags(questions: Question[]): Question[] {
  return questions.map((q) =>
    q.tags && q.tags.length > 0
      ? { ...q, tags: q.tags.map((t) => (t.startsWith("#") ? t : `#${t}`)) }
      : q,
  )
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

export async function getExamStats(
  examId: string,
): Promise<Map<string, QuestionStat>> {
  try {
    const data = await get<ExamStatsResponse>(
      `/v1/exams/${encodeURIComponent(examId)}/stats`,
      STATS_REVALIDATE,
    )
    return new Map(data.stats.map((s) => [s.question_id, s]))
  } catch {
    return new Map()
  }
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

export async function getIpExamStats(
  examId: string,
): Promise<Map<string, QuestionStat>> {
  try {
    const data = await get<ExamStatsResponse>(
      `/v1/ip/exams/${encodeURIComponent(examId)}/stats`,
      STATS_REVALIDATE,
    )
    return new Map(data.stats.map((s) => [s.question_id, s]))
  } catch {
    return new Map()
  }
}

export async function listApExams(): Promise<ExamSummary[]> {
  const data = await get<ExamListResponse>("/v1/ap/exams", EXAMS_REVALIDATE)
  return data.exams
}

export async function listApQuestions(examId: string): Promise<Question[]> {
  const data = await get<QuestionListResponse>(
    `/v1/ap/exams/${encodeURIComponent(examId)}/questions`,
    QUESTIONS_REVALIDATE,
  )
  // AP データのタグは "#" 接頭辞なし(例: "セキュリティ")。FE/IP/TK は "#" 付き
  // (例: "#セキュリティ")で、web のタグ URL・チップ・関連タグ・カテゴリ集計は
  // すべて "#" 付きを前提とする(lib/tag-url.ts の slugToTag が "#" を補う)。
  // ここで AP のタグを "#" 付きへ正規化し、タグまわりを他試験と同一挙動にする。
  return normalizeQuestionTags(data.questions)
}

export async function getApExamStats(
  examId: string,
): Promise<Map<string, QuestionStat>> {
  try {
    const data = await get<ExamStatsResponse>(
      `/v1/ap/exams/${encodeURIComponent(examId)}/stats`,
      STATS_REVALIDATE,
    )
    return new Map(data.stats.map((s) => [s.question_id, s]))
  } catch {
    return new Map()
  }
}

export async function listSgExams(): Promise<ExamSummary[]> {
  const data = await get<ExamListResponse>("/v1/sg/exams", EXAMS_REVALIDATE)
  return data.exams
}

export async function listSgQuestions(examId: string): Promise<Question[]> {
  const data = await get<QuestionListResponse>(
    `/v1/sg/exams/${encodeURIComponent(examId)}/questions`,
    QUESTIONS_REVALIDATE,
  )
  // SG のタグも AP と同様 "#" 接頭辞なしで返るため、ここで "#" 付きへ正規化し
  // タグ URL・チップ・関連タグ・カテゴリ集計を他試験と同一挙動にする。
  return normalizeQuestionTags(data.questions)
}

export async function getSgExamStats(
  examId: string,
): Promise<Map<string, QuestionStat>> {
  try {
    const data = await get<ExamStatsResponse>(
      `/v1/sg/exams/${encodeURIComponent(examId)}/stats`,
      STATS_REVALIDATE,
    )
    return new Map(data.stats.map((s) => [s.question_id, s]))
  } catch {
    return new Map()
  }
}

export async function listScPopularTags(limit = 12): Promise<PopularTag[]> {
  try {
    const data = await get<PopularTagListResponse>(
      `/v1/sc/tags/popular?limit=${limit}`,
      EXAMS_REVALIDATE,
    )
    // SC のタグは API から "#" 接頭辞なしで返る場合があるため、表示・URL 生成に
    // 使う前に "#" 付きへ正規化しておく (他試験と整合)。
    return data.tags.map((t) =>
      t.tag.startsWith("#") ? t : { ...t, tag: `#${t.tag}` },
    )
  } catch {
    return []
  }
}

export async function listScExams(): Promise<ExamSummary[]> {
  try {
    const data = await get<ExamListResponse>("/v1/sc/exams", EXAMS_REVALIDATE)
    return data.exams
  } catch {
    // SC データはまだ pipeline 側の DB 配備待ち。API が 404/未配備のときは
    // 空配列を返し、SC の各ページが「準備中」表示にフォールバックできるよう
    // にする。データ配備後は自動的にホーム画面型 UI に切り替わる。
    return []
  }
}

export async function listScQuestions(examId: string): Promise<Question[]> {
  const data = await get<QuestionListResponse>(
    `/v1/sc/exams/${encodeURIComponent(examId)}/questions`,
    QUESTIONS_REVALIDATE,
  )
  // SC のタグも SG/AP と同じく "#" 接頭辞なしで返るため、ここで "#" 付きへ
  // 正規化してタグ URL・チップ・関連タグ・カテゴリ集計を他試験と同一挙動にする。
  return normalizeQuestionTags(data.questions)
}

export async function getScExamStats(
  examId: string,
): Promise<Map<string, QuestionStat>> {
  try {
    const data = await get<ExamStatsResponse>(
      `/v1/sc/exams/${encodeURIComponent(examId)}/stats`,
      STATS_REVALIDATE,
    )
    return new Map(data.stats.map((s) => [s.question_id, s]))
  } catch {
    return new Map()
  }
}

export async function listDkPopularTags(limit = 12): Promise<PopularTag[]> {
  try {
    const data = await get<PopularTagListResponse>(
      `/v1/dk/tags/popular?limit=${limit}`,
      EXAMS_REVALIDATE,
    )
    return data.tags.map((t) =>
      t.tag.startsWith("#") ? t : { ...t, tag: `#${t.tag}` },
    )
  } catch {
    return []
  }
}

export async function listDkExams(): Promise<ExamSummary[]> {
  const data = await get<ExamListResponse>("/v1/dk/exams", EXAMS_REVALIDATE)
  return data.exams
}

export async function listDkQuestions(examId: string): Promise<Question[]> {
  const data = await get<QuestionListResponse>(
    `/v1/dk/exams/${encodeURIComponent(examId)}/questions`,
    QUESTIONS_REVALIDATE,
  )
  return normalizeQuestionTags(data.questions)
}

export async function getDkExamStats(
  examId: string,
): Promise<Map<string, QuestionStat>> {
  try {
    const data = await get<ExamStatsResponse>(
      `/v1/dk/exams/${encodeURIComponent(examId)}/stats`,
      STATS_REVALIDATE,
    )
    return new Map(data.stats.map((s) => [s.question_id, s]))
  } catch {
    return new Map()
  }
}
