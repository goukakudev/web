/**
 * Browser-only device id helper for 宅建 attempt logging.
 * FE側の lib/local-store.ts と分離した名前空間で動作。
 */

const STORAGE_KEY = "tk_device_id";
const ATTEMPTS_KEY = "tk_attempts";
const MAX_ATTEMPTS = 5000;

export function getTkDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export interface TkAttemptLog {
  questionId: string;
  examId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  skipped: boolean;
  ts: number;
}

export function recordTkLocalAttempt(log: TkAttemptLog): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    const arr: TkAttemptLog[] = raw ? JSON.parse(raw) : [];
    arr.push(log);
    if (arr.length > MAX_ATTEMPTS) arr.splice(0, arr.length - MAX_ATTEMPTS);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(arr));
  } catch {
    /* silent */
  }
}

export function getTkLocalAttempts(): TkAttemptLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as TkAttemptLog[]) : [];
  } catch {
    return [];
  }
}

export async function postTkAttempt(input: {
  questionId: string;
  examId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  skipped: boolean;
  sessionId?: string;
}): Promise<void> {
  try {
    await fetch("/api/tk/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: getTkDeviceId(),
        question_id: input.questionId,
        exam_id: input.examId,
        selected_answer: input.selectedAnswer,
        is_correct: input.isCorrect,
        skipped: input.skipped,
        client_ts: new Date().toISOString(),
        ...(input.sessionId ? { session_id: input.sessionId } : {}),
      }),
      keepalive: true,
    });
  } catch {
    /* silent */
  }
}
