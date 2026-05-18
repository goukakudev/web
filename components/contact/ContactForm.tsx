"use client";

import { useState } from "react";
import { submitFeedback } from "@/lib/client-api";
import { getDeviceId } from "@/lib/local-store";

type Status = "idle" | "submitting" | "ok" | "error";

export function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (message.trim().length === 0) return;
    setStatus("submitting");
    try {
      await submitFeedback({
        device_id: getDeviceId(),
        question_id: "__site_contact__",
        exam_id: "__site_contact__",
        rating: null,
        comment: email.trim()
          ? `[from: ${email.trim()}]\n${message.trim()}`
          : message.trim(),
        client_ts: new Date().toISOString(),
      });
      setStatus("ok");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-[12px] font-extrabold text-goukaku-ink/70">
        メール (任意 — 返信を希望する場合)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 w-full px-3 py-2 rounded-lg border border-goukaku-divider bg-goukaku-surface text-[13px] font-medium"
        />
      </label>
      <label className="text-[12px] font-extrabold text-goukaku-ink/70">
        本文 (必須)
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="ご質問・誤植のご指摘・ご要望などお気軽にどうぞ"
          required
          className="mt-1 w-full px-3 py-2 rounded-lg border border-goukaku-divider bg-goukaku-surface text-[13px] font-medium resize-y"
        />
      </label>
      <button
        type="submit"
        disabled={status === "submitting" || message.trim().length === 0}
        className="self-start px-5 py-2.5 rounded-full bg-goukaku-ink text-goukaku-lime font-extrabold text-[13px] disabled:opacity-40"
      >
        {status === "submitting" ? "送信中…" : "送信"}
      </button>
      {status === "ok" && (
        <p className="text-[12px] font-extrabold text-[#5D8C00]">
          ご意見ありがとうございます。送信しました。
        </p>
      )}
      {status === "error" && (
        <p className="text-[12px] font-extrabold text-goukaku-pink-script">
          送信に失敗しました。お手数ですが、メールでもご連絡ください。
        </p>
      )}
    </form>
  );
}
