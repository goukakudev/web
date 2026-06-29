import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe("events and pro lead APIs", () => {
  it("records allowed analytics events", async () => {
    const dir = await mkdtemp(join(tmpdir(), "goukaku-events-"))
    process.env.EVENT_LOG_PATH = join(dir, "events.jsonl")
    const { POST } = await import("@/app/api/events/route")
    const res = await POST(
      new Request("https://goukaku.dev/api/events", {
        method: "POST",
        body: JSON.stringify({
          name: "pro_cta_click",
          props: { source: "test" },
          path: "/pro",
        }),
      }),
    )
    expect(res.status).toBe(200)
    const raw = await readFile(process.env.EVENT_LOG_PATH, "utf8")
    expect(raw).toContain('"name":"pro_cta_click"')
    expect(raw).toContain('"path":"/pro"')
  })

  it("records pro waitlist leads", async () => {
    const dir = await mkdtemp(join(tmpdir(), "goukaku-leads-"))
    process.env.PRO_LEADS_LOG_PATH = join(dir, "leads.jsonl")
    const { POST } = await import("@/app/api/pro-leads/route")
    const res = await POST(
      new Request("https://goukaku.dev/api/pro-leads", {
        method: "POST",
        body: JSON.stringify({
          email: "USER@example.com",
          subject: "ip",
          role: "individual",
          interests: ["弱点分析"],
        }),
      }),
    )
    expect(res.status).toBe(200)
    const raw = await readFile(process.env.PRO_LEADS_LOG_PATH, "utf8")
    expect(raw).toContain('"email":"user@example.com"')
    expect(raw).toContain('"subject":"ip"')
  })

  it("forwards pro waitlist leads to a configured webhook", async () => {
    const dir = await mkdtemp(join(tmpdir(), "goukaku-leads-webhook-"))
    process.env.PRO_LEADS_LOG_PATH = join(dir, "leads.jsonl")
    process.env.PRO_LEADS_WEBHOOK_URL = "https://example.test/pro-leads"
    process.env.PRO_LEADS_WEBHOOK_TOKEN = "secret-token"
    const fetchMock = vi.fn<(...args: Parameters<typeof fetch>) => Promise<Response>>(
      async () => new Response(null, { status: 204 }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const { POST } = await import("@/app/api/pro-leads/route")
    const res = await POST(
      new Request("https://goukaku.dev/api/pro-leads", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          subject: "ip",
          role: "individual",
          interests: ["弱点分析"],
        }),
      }),
    )

    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledOnce()
    const [, init] = fetchMock.mock.calls[0] as Parameters<typeof fetch>
    expect(init?.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer secret-token",
    })
    expect(String(init?.body)).toContain('"type":"pro_lead"')
  })

  it("does not accept pro leads as saved when the required webhook fails", async () => {
    const dir = await mkdtemp(join(tmpdir(), "goukaku-leads-webhook-fail-"))
    process.env.PRO_LEADS_LOG_PATH = join(dir, "leads.jsonl")
    process.env.PRO_LEADS_WEBHOOK_URL = "https://example.test/pro-leads"
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })))

    const { POST } = await import("@/app/api/pro-leads/route")
    const res = await POST(
      new Request("https://goukaku.dev/api/pro-leads", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          subject: "ip",
          role: "individual",
          interests: ["弱点分析"],
        }),
      }),
    )

    expect(res.status).toBe(502)
  })
})
