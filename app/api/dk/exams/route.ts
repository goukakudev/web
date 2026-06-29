import { NextResponse } from "next/server"
import { listDkExams } from "@/lib/api-client"

export async function GET(): Promise<NextResponse> {
  try {
    const exams = await listDkExams()
    return NextResponse.json({ exams })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
