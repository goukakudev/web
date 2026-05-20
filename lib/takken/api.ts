/**
 * Server-only API client for /v1/tk/* (宅建).
 * 既存 lib/api-client.ts (FE) と同じパターンで実装。
 */
import "server-only";

const EXAMS_REVALIDATE = 60 * 60; // 1h
const QUESTIONS_REVALIDATE = 60 * 60 * 24; // 24h

function baseUrl(): string {
  const v = process.env.API_BASE;
  if (!v) throw new Error("API_BASE env var not set");
  return v.replace(/\/+$/, "");
}

function apiKey(): string {
  const v = process.env.API_KEY;
  if (!v) throw new Error("API_KEY env var not set");
  return v;
}

async function get<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    headers: { "X-API-Key": apiKey(), Accept: "application/json" },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} on GET ${path}`);
  }
  return (await res.json()) as T;
}

async function post(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} on POST ${path}`);
  }
}

// ============================================================
// Types
// ============================================================
export interface TakkenExam {
  exam_id: string;
  era: "令和" | "平成";
  era_year: number;
  exam_month: number;
  year: number;
  label: string;
  passing_score: number | null;
  question_count: number;
}

export interface TakkenStatement {
  label: string;
  text: string;
  is_correct?: boolean | null;
}

export interface TakkenExplanation {
  _id: string;
  commentary?: string | null;
  choice_explanations?: Record<string, string> | null;
  key_law?: string[];
  confidence?: number | null;
  needs_review?: boolean;
}

export type TakkenCategory =
  | "権利関係"
  | "宅建業法"
  | "法令上の制限"
  | "税その他"
  | "不明";

export type TakkenFormat = "simple" | "combination" | "count";

export interface TakkenQuestion {
  _id: string;
  exam_id?: string;
  era?: string;
  era_year?: number;
  exam_month?: number;
  question_number: number;
  category: TakkenCategory;
  sub_category?: string | null;
  format: TakkenFormat;
  question_type?: string | null;
  question_text: string;
  choices: Record<string, string>;
  statements?: TakkenStatement[] | null;
  correct_answer: number | null;
  accepted_answers: number[];
  answer_note?: string | null;
  confidence?: number | null;
  tags?: string[];
  explanation?: TakkenExplanation | null;
}

// ============================================================
// Takken API
// ============================================================
export const TakkenAPI = {
  async listExams(): Promise<TakkenExam[]> {
    const data = await get<{ exams: TakkenExam[] }>("/v1/tk/exams", EXAMS_REVALIDATE);
    return data.exams;
  },

  async getExam(examId: string): Promise<TakkenExam | null> {
    try {
      return await get<TakkenExam>(
        `/v1/tk/exams/${encodeURIComponent(examId)}`,
        EXAMS_REVALIDATE,
      );
    } catch {
      return null;
    }
  },

  async listExamQuestions(examId: string): Promise<{
    exam_id: string;
    count: number;
    questions: TakkenQuestion[];
  } | null> {
    try {
      return await get(
        `/v1/tk/exams/${encodeURIComponent(examId)}/questions`,
        QUESTIONS_REVALIDATE,
      );
    } catch {
      return null;
    }
  },

  async getQuestion(questionId: string): Promise<TakkenQuestion | null> {
    try {
      return await get<TakkenQuestion>(
        `/v1/tk/questions/${encodeURIComponent(questionId)}`,
        QUESTIONS_REVALIDATE,
      );
    } catch {
      return null;
    }
  },

  async listCategoryQuestions(category: string): Promise<{
    category: string;
    count: number;
    questions: TakkenQuestion[];
  }> {
    return get(
      `/v1/tk/categories/${encodeURIComponent(category)}/questions`,
      QUESTIONS_REVALIDATE,
    );
  },

  async recordAnswer(input: {
    device_id: string;
    question_id: string;
    exam_id: string;
    selected_answer: number | null;
    is_correct: boolean;
    skipped: boolean;
    client_ts: string;
    session_id?: string;
  }): Promise<void> {
    await post("/v1/tk/answers", input);
  },

  async recordFeedback(input: {
    device_id: string;
    question_id: string;
    exam_id: string;
    rating: "good" | "bad" | null;
    comment: string | null;
    client_ts: string;
  }): Promise<void> {
    await post("/v1/tk/feedback", input);
  },
};
