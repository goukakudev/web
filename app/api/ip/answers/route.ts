import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const apiBase = process.env.API_BASE
  const apiKey = process.env.API_KEY
  if (!apiBase || !apiKey) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${apiBase.replace(/\/+$/, "")}/v1/ip/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    })
  } catch {
    return NextResponse.json({ error: "upstream unreachable" }, { status: 502 })
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: `upstream ${upstream.status}` }, { status: upstream.status })
  }
  return NextResponse.json({ ok: true }, { status: 200 })
}
