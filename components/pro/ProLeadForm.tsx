"use client"

import { FormEvent, useState } from "react"
import { trackEvent } from "@/lib/client-events"

const INTERESTS = [
  "広告なし",
  "弱点分析",
  "間違いノート",
  "復習リマインダー",
  "模試履歴保存",
  "PDF要点シート",
]

export function ProLeadForm() {
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("ip")
  const [role, setRole] = useState("individual")
  const [interests, setInterests] = useState<string[]>(["弱点分析", "復習リマインダー"])
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle")

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "submitting") return
    setStatus("submitting")
    const body = { email, subject, role, interests, source: "pro_page_form" }
    try {
      const res = await fetch("/api/pro-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("failed")
      trackEvent("pro_signup_click", { source: "pro_page_form", subject, role })
      setStatus("done")
    } catch {
      setStatus("error")
    }
  }

  function toggleInterest(value: string) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 rounded-xl border border-goukaku-divider bg-goukaku-surface/55 p-4"
    >
      <h2 className="text-[15px] font-extrabold">Proの案内を受け取る</h2>
      <p className="mt-1 text-[12px] leading-relaxed text-goukaku-ink/65">
        提供開始時の案内、弱点分析や復習機能の先行テスト募集を受け取れます。
      </p>

      <label className="mt-4 block text-[12px] font-bold">
        メールアドレス
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-lg border border-goukaku-divider bg-white/70 px-3 py-3 text-[16px] text-goukaku-ink outline-none focus:border-goukaku-ink"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="block text-[12px] font-bold">
          対象
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-1 w-full rounded-lg border border-goukaku-divider bg-white/70 px-3 py-3 text-[13px]"
          >
            <option value="ip">ITパスポート</option>
            <option value="fe">基本情報</option>
            <option value="sg">情報セキュリティ</option>
            <option value="school">法人・学校</option>
          </select>
        </label>
        <label className="block text-[12px] font-bold">
          利用区分
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="mt-1 w-full rounded-lg border border-goukaku-divider bg-white/70 px-3 py-3 text-[13px]"
          >
            <option value="individual">個人</option>
            <option value="teacher">教員・研修担当</option>
            <option value="company">法人</option>
          </select>
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className="text-[12px] font-bold">関心のある機能</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {INTERESTS.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 rounded-lg border border-goukaku-divider bg-white/45 px-3 py-2 text-[12px]"
            >
              <input
                type="checkbox"
                checked={interests.includes(item)}
                onChange={() => toggleInterest(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-goukaku-ink-fixed px-4 py-3 text-[13px] font-extrabold text-goukaku-lime disabled:opacity-60"
      >
        {status === "submitting" ? "送信中" : "案内を受け取る"}
      </button>
      {status === "done" && (
        <p className="mt-3 text-[12px] font-bold text-goukaku-ink/75">
          登録しました。提供準備が進んだ段階で案内します。
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-[12px] font-bold text-goukaku-pink-script">
          送信できませんでした。時間をおいて再度試してください。
        </p>
      )}
    </form>
  )
}
