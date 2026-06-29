import { appendFile, mkdir } from "node:fs/promises"
import { dirname } from "node:path"

export async function appendJsonLine(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await appendFile(path, `${JSON.stringify(value)}\n`, "utf8")
}

export interface PersistJsonRecordOptions {
  path: string
  value: unknown
  webhookUrl?: string
  webhookToken?: string
  requireWebhook?: boolean
}

export async function persistJsonRecord({
  path,
  value,
  webhookUrl,
  webhookToken,
  requireWebhook = false,
}: PersistJsonRecordOptions): Promise<void> {
  let localError: unknown = null
  let webhookError: unknown = null
  let persisted = false

  try {
    await appendJsonLine(path, value)
    persisted = true
  } catch (error) {
    localError = error
  }

  if (webhookUrl) {
    try {
      await postJsonWebhook(webhookUrl, value, webhookToken)
      persisted = true
    } catch (error) {
      webhookError = error
    }
  }

  if ((requireWebhook && webhookUrl && webhookError) || !persisted) {
    throw new AggregateError(
      [localError, webhookError].filter(Boolean),
      "failed_to_persist_json_record",
    )
  }
}

async function postJsonWebhook(
  url: string,
  value: unknown,
  token?: string,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(value),
  })
  if (!response.ok) {
    throw new Error(`webhook_failed:${response.status}`)
  }
}
