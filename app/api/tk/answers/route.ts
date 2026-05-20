import { NextResponse } from "next/server";
import { TakkenAPI } from "@/lib/takken/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const deviceId = b["device_id"];
  const questionId = b["question_id"];
  const examId = b["exam_id"];
  const selectedAnswerRaw = b["selected_answer"];
  const isCorrectRaw = b["is_correct"];
  const skippedRaw = b["skipped"];
  const clientTs = b["client_ts"];
  const sessionId = b["session_id"];

  if (
    typeof deviceId !== "string" ||
    typeof questionId !== "string" ||
    typeof examId !== "string" ||
    typeof clientTs !== "string"
  ) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const selectedAnswer =
    typeof selectedAnswerRaw === "number" &&
    [1, 2, 3, 4].includes(selectedAnswerRaw)
      ? selectedAnswerRaw
      : null;
  const isCorrect = isCorrectRaw === true;
  const skipped = skippedRaw === true;

  try {
    await TakkenAPI.recordAnswer({
      device_id: deviceId,
      question_id: questionId,
      exam_id: examId,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      skipped,
      client_ts: clientTs,
      ...(typeof sessionId === "string" ? { session_id: sessionId } : {}),
    });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[/api/tk/answers]", e);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
