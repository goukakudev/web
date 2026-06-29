import { NextResponse } from "next/server"
import {
  listApExams,
  listDkExams,
  listFeExams,
  listIpExams,
  listScExams,
  listSgExams,
} from "@/lib/api-client"
import type { ExamSummary } from "@/lib/types"

type SubjectParam = "fe" | "ip" | "ap" | "sg" | "sc" | "dk" | "denki"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subject: string }> },
): Promise<NextResponse> {
  const { subject } = await params
  try {
    const exams = await listSubjectExams(subject)
    if (!exams) {
      return NextResponse.json({ error: "unknown_subject" }, { status: 404 })
    }
    return NextResponse.json({ exams })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

function listSubjectExams(subject: string): Promise<ExamSummary[]> | null {
  switch (subject as SubjectParam) {
    case "fe":
      return listFeExams()
    case "ip":
      return listIpExams()
    case "ap":
      return listApExams()
    case "sg":
      return listSgExams()
    case "sc":
      return listScExams()
    case "dk":
    case "denki":
      return listDkExams()
    default:
      return null
  }
}
