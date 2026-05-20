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
  const ratingRaw = b["rating"];
  const comment = b["comment"];
  const clientTs = b["client_ts"];

  if (
    typeof deviceId !== "string" ||
    typeof questionId !== "string" ||
    typeof examId !== "string" ||
    typeof clientTs !== "string"
  ) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const rating: "good" | "bad" | null =
    ratingRaw === "good" || ratingRaw === "bad" ? ratingRaw : null;
  const commentStr =
    typeof comment === "string" && comment.trim().length > 0 ? comment : null;

  try {
    await TakkenAPI.recordFeedback({
      device_id: deviceId,
      question_id: questionId,
      exam_id: examId,
      rating,
      comment: commentStr,
      client_ts: clientTs,
    });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[/api/tk/feedback]", e);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
