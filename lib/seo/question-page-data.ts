import {
  listExams,
  listIpExams,
  listIpQuestions,
  listQuestions,
  listSgExams,
  listSgQuestions,
} from "@/lib/api-client"
import type { ExamSummary, Question } from "@/lib/types"
import {
  parseQuestionSlug,
  questionCanonicalPath,
  type SeoQuestionSubject,
} from "@/lib/seo/question-url"

export interface SeoQuestionPageData {
  exam: ExamSummary
  question: Question
  questions: Question[]
  canonicalPath: string
}

export async function loadSeoQuestionPageData(
  subject: SeoQuestionSubject,
  slug: string,
): Promise<SeoQuestionPageData | null> {
  const exams = await listSubjectExams(subject)
  const parsed = parseQuestionSlug(subject, slug, exams)
  if (!parsed) return null
  const questions = await listSubjectQuestions(subject, parsed.exam.exam_id)
  const question = questions.find((item) => item.q_number === parsed.qNumber)
  if (!question) return null
  return {
    exam: parsed.exam,
    question,
    questions,
    canonicalPath: questionCanonicalPath(subject, parsed.exam, question),
  }
}

async function listSubjectExams(subject: SeoQuestionSubject): Promise<ExamSummary[]> {
  if (subject === "ip") return listIpExams()
  if (subject === "sg") return listSgExams()
  return (await listExams()).filter((exam) => exam.exam_id.startsWith("fe-"))
}

async function listSubjectQuestions(
  subject: SeoQuestionSubject,
  examId: string,
): Promise<Question[]> {
  if (subject === "ip") return listIpQuestions(examId)
  if (subject === "sg") return listSgQuestions(examId)
  return listQuestions(examId)
}
