import { NextResponse } from "next/server";
import { TakkenAPI } from "@/lib/takken/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }
  try {
    const q = await TakkenAPI.getQuestion(id);
    if (!q) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json(q, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
    });
  } catch (e) {
    console.error("[/api/tk/questions/[id]]", e);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
