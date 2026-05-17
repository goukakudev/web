const KEY = "examquiz.pending.v1"

export interface PendingRequest {
  id: string
  created_at: string
  method: "POST"
  path: string
  body: unknown
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

export function loadPendingRequests(): PendingRequest[] {
  if (!isBrowser()) return []
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as PendingRequest[]
  } catch {
    return []
  }
}

function save(items: PendingRequest[]): void {
  if (!isBrowser()) return
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function enqueueRequest(input: { method: "POST"; path: string; body: unknown }): void {
  const item: PendingRequest = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    method: input.method,
    path: input.path,
    body: input.body,
  }
  save([...loadPendingRequests(), item])
}

export function removePendingRequest(id: string): void {
  save(loadPendingRequests().filter((p) => p.id !== id))
}
