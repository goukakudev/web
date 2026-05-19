import { enqueueRequest, loadPendingRequests, removePendingRequest } from "./pending-queue"
import type { WeakTag } from "./types"

export type { WeakTag }

export interface AnswerLogPayload {
  device_id: string
  question_id: string
  exam_id: string
  selected_label: string | null
  correct_label: string | null
  is_correct: boolean
  skipped: boolean
  client_ts: string
}

export interface FeedbackPayload {
  device_id: string
  question_id: string
  exam_id: string
  rating: string | null
  comment: string | null
  client_ts: string
}

async function postOrQueue(path: string, body: unknown): Promise<void> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) return
    if (res.status >= 400 && res.status < 500) {
      console.warn(`[client-api] ${res.status} from ${path}, dropping`)
      return
    }
    enqueueRequest({ method: "POST", path, body })
  } catch {
    enqueueRequest({ method: "POST", path, body })
  }
}

export async function recordAnswer(payload: AnswerLogPayload): Promise<void> {
  await postOrQueue("/api/answers", payload)
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  await postOrQueue("/api/feedback", payload)
}

export async function fetchWeakTags(
  deviceId: string,
  limit = 10,
): Promise<WeakTag[]> {
  try {
    const res = await fetch(
      `/api/users/${encodeURIComponent(deviceId)}/weak-tags?limit=${limit}`,
      { method: "GET" },
    )
    if (!res.ok) return []
    const data = (await res.json()) as { tags?: WeakTag[] }
    return data.tags ?? []
  } catch {
    return []
  }
}

export async function flushPendingRequests(): Promise<void> {
  const items = loadPendingRequests()
  for (const item of items) {
    try {
      const res = await fetch(item.path, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.body),
      })
      if (res.ok) {
        removePendingRequest(item.id)
        continue
      }
      if (res.status >= 400 && res.status < 500) {
        removePendingRequest(item.id)
        continue
      }
      return
    } catch {
      return
    }
  }
}
