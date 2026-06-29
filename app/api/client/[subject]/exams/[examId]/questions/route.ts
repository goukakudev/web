import { NextResponse } from "next/server"
import {
  listApQuestions,
  listDkQuestions,
  listIpQuestions,
  listQuestions,
  listScQuestions,
  listSgQuestions,
} from "@/lib/api-client"
import type { Question } from "@/lib/types"

type SubjectParam = "fe" | "ip" | "ap" | "sg" | "sc" | "dk" | "denki"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subject: string; examId: string }> },
): Promise<NextResponse> {
  const { subject, examId } = await params
  try {
    const questions = await listSubjectQuestions(subject, examId)
    if (!questions) {
      return NextResponse.json({ error: "unknown_subject" }, { status: 404 })
    }
    return NextResponse.json({
      exam_id: examId,
      count: questions.length,
      questions,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

function listSubjectQuestions(
  subject: string,
  examId: string,
): Promise<Question[]> | null {
  switch (subject as SubjectParam) {
    case "fe":
      return listQuestions(examId)
    case "ip":
      return listIpQuestions(examId)
    case "ap":
      return listApQuestions(examId)
    case "sg":
      return listSgQuestions(examId)
    case "sc":
      return listScQuestions(examId)
    case "dk":
    case "denki":
      return listDkQuestions(examId)
    default:
      return null
  }
}
