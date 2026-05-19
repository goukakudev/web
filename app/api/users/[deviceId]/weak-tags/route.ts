import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> },
): Promise<NextResponse> {
  const apiBase = process.env.API_BASE
  const apiKey = process.env.API_KEY
  if (!apiBase || !apiKey) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 })
  }

  const { deviceId } = await params
  if (!deviceId || deviceId.length === 0) {
    return NextResponse.json({ error: "invalid device id" }, { status: 400 })
  }

  const url = new URL(request.url)
  const limit = url.searchParams.get("limit") ?? "10"
  const minAnswered = url.searchParams.get("min_answered") ?? "3"

  const upstreamUrl =
    `${apiBase.replace(/\/+$/, "")}/v1/users/${encodeURIComponent(deviceId)}/weak-tags` +
    `?limit=${encodeURIComponent(limit)}&min_answered=${encodeURIComponent(minAnswered)}`

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
    })
  } catch {
    return NextResponse.json({ error: "upstream unreachable" }, { status: 502 })
  }
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `upstream ${upstream.status}` },
      { status: upstream.status },
    )
  }
  const data = await upstream.json()
  return NextResponse.json(data, { status: 200 })
}
