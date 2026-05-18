const KEY = "examquiz.sessions.v1";

export interface ExamSession {
  id: string;
  exam_id: string;
  finished_at: string;
  elapsed_seconds: number;
  correct: number;
  answered: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadExamSessions(): ExamSession[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ExamSession[]) : [];
  } catch {
    return [];
  }
}

function save(items: ExamSession[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addExamSession(session: ExamSession): void {
  const existing = loadExamSessions().filter((s) => s.id !== session.id);
  const next = [...existing, session].sort((a, b) =>
    b.finished_at.localeCompare(a.finished_at),
  );
  save(next);
}

export function latestSessionFor(examId: string): ExamSession | undefined {
  return loadExamSessions().find((s) => s.exam_id === examId);
}
