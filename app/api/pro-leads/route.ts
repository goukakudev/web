import { persistJsonRecord } from "@/lib/server/jsonl-log"

export const runtime = "nodejs"

const PRO_LEADS_LOG_PATH =
  process.env.PRO_LEADS_LOG_PATH ?? "/tmp/goukaku-pro-leads.jsonl"
const PRO_LEADS_WEBHOOK_URL = process.env.PRO_LEADS_WEBHOOK_URL
const PRO_LEADS_WEBHOOK_TOKEN = process.env.PRO_LEADS_WEBHOOK_TOKEN

export async function POST(request: Request) {
  const payload = await readJson(request)
  const email = normalizeEmail(payload.email)
  if (!email) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 })
  }

  const subject = stringValue(payload.subject, 20)
  const role = stringValue(payload.role, 40)
  const source = stringValue(payload.source, 80) || "pro_page"
  const interests = Array.isArray(payload.interests)
    ? payload.interests
        .filter((item): item is string => typeof item === "string")
        .slice(0, 8)
        .map((item) => item.slice(0, 80))
    : []

  const record = {
    type: "pro_lead",
    email,
    subject,
    role,
    interests,
    source,
    referrer: request.headers.get("referer")?.slice(0, 500) ?? "",
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? "",
    ts: new Date().toISOString(),
  }

  try {
    await persistJsonRecord({
      path: PRO_LEADS_LOG_PATH,
      webhookUrl: PRO_LEADS_WEBHOOK_URL,
      webhookToken: PRO_LEADS_WEBHOOK_TOKEN,
      requireWebhook: Boolean(PRO_LEADS_WEBHOOK_URL),
      value: record,
    })
  } catch {
    return Response.json({ ok: false, error: "persist_failed" }, { status: 502 })
  }

  return Response.json({ ok: true })
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") return ""
  const email = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.slice(0, 254) : ""
}

function stringValue(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}
