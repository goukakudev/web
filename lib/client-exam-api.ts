import type { ExamListResponse, ExamSummary, Question, QuestionListResponse } from "./types"
import type { QuizSubject } from "./exam-utils"

export function subjectForExamId(examId: string): QuizSubject | null {
  if (examId.startsWith("ee2-")) return "dk"
  if (examId.startsWith("fe-")) return "fe"
  if (examId.startsWith("ip-")) return "ip"
  if (examId.startsWith("ap-")) return "ap"
  if (examId.startsWith("sg-")) return "sg"
  if (examId.startsWith("sc-")) return "sc"
  return null
}

export function playPathForExamId(examId: string, qNumber: number): string {
  const subject = subjectForExamId(examId)
  const base = subject === "dk" ? "/denki" : subject ? `/${subject}` : "/fe"
  return `${base}/play/${examId}/q/${qNumber}`
}

export async function listClientExams(
  subject: QuizSubject,
): Promise<ExamSummary[]> {
  const data = await getClientJson<ExamListResponse>(
    `/api/client/${subject}/exams`,
  )
  return data.exams
}

export async function listClientQuestions(
  subject: QuizSubject,
  examId: string,
): Promise<Question[]> {
  const data = await getClientJson<QuestionListResponse>(
    `/api/client/${subject}/exams/${encodeURIComponent(examId)}/questions`,
  )
  return data.questions
}

async function getClientJson<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    throw new Error(`API ${res.status} on GET ${path}`)
  }
  return (await res.json()) as T
}
