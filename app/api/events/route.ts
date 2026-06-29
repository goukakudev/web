import { persistJsonRecord } from "@/lib/server/jsonl-log"

export const runtime = "nodejs"

const EVENT_LOG_PATH = process.env.EVENT_LOG_PATH ?? "/tmp/goukaku-events.jsonl"
const EVENT_WEBHOOK_URL = process.env.EVENT_WEBHOOK_URL
const EVENT_WEBHOOK_TOKEN = process.env.EVENT_WEBHOOK_TOKEN
const ALLOWED_EVENTS = new Set([
  "start_practice_click",
  "question_answer_submit",
  "explanation_open",
  "related_question_click",
  "glossary_link_click",
  "mock_start",
  "mock_complete",
  "app_store_click",
  "pro_cta_click",
  "pro_signup_click",
  "ad_slot_view",
])

export async function POST(request: Request) {
  const payload = await readJson(request)
  const name = typeof payload.name === "string" ? payload.name : ""
  if (!ALLOWED_EVENTS.has(name)) {
    return Response.json({ ok: false, error: "unknown_event" }, { status: 400 })
  }

  const record = {
    type: "event",
    name,
    props: sanitizeProps(payload.props),
    path: typeof payload.path === "string" ? payload.path.slice(0, 240) : "",
    referrer: request.headers.get("referer")?.slice(0, 500) ?? "",
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? "",
    ts: new Date().toISOString(),
  }

  await persistJsonRecord({
    path: EVENT_LOG_PATH,
    webhookUrl: EVENT_WEBHOOK_URL,
    webhookToken: EVENT_WEBHOOK_TOKEN,
    value: record,
  })

  return Response.json({ ok: true })
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

function sanitizeProps(value: unknown): Record<string, string | number | boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const out: Record<string, string | number | boolean> = {}
  for (const [key, raw] of Object.entries(value)) {
    if (!/^[a-zA-Z0-9_:-]{1,40}$/.test(key)) continue
    if (
      typeof raw === "string" ||
      typeof raw === "number" ||
      typeof raw === "boolean"
    ) {
      out[key] = typeof raw === "string" ? raw.slice(0, 160) : raw
    }
  }
  return out
}
