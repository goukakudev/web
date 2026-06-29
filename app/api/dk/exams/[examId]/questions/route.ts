import { NextResponse } from "next/server"
import { listDkQuestions } from "@/lib/api-client"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
): Promise<NextResponse> {
  const { examId } = await params

  try {
    const questions = await listDkQuestions(examId)
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
