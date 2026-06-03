import { NextResponse } from "next/server"

// 看護の回答ログを上流 API(/v1/kn/answers) へ転送する best-effort プロキシ。
// クライアントは API_KEY を持たないため、サーバー経由で送る (宅建 /api/tk/answers と同型)。
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const base = process.env.API_BASE
  const key = process.env.API_KEY
  if (!base || !key) {
    return NextResponse.json({ error: "server_misconfig" }, { status: 500 })
  }

  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/v1/kn/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": key },
      body: JSON.stringify(body),
    })
    if (!res.ok) return NextResponse.json({ error: "upstream" }, { status: 502 })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error("[/api/kn/answers]", e)
    return NextResponse.json({ error: "upstream_error" }, { status: 502 })
  }
}
