"use client"
// お気に入り (localStorage)。問題本文は持たないため、試験別にまとめてその試験へ誘導する。
import { useState, useEffect } from "react"
import Link from "next/link"
import { kangoBookmarks } from "@/lib/kango/store"
import { examLabelFromId, examIdFromQuestionId } from "@/lib/kango/exam"
import { KangoNav, KangoBreadcrumb } from "@/components/kango/KangoNav"

export default function KangoBookmarksPage() {
  const [byExam, setByExam] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  useEffect(() => {
    const ids = [...kangoBookmarks()]
    const m: Record<string, number> = {}
    for (const id of ids) {
      const eid = examIdFromQuestionId(id)
      m[eid] = (m[eid] ?? 0) + 1
    }
    setByExam(m)
    setTotal(ids.length)
  }, [])

  const entries = Object.entries(byExam).sort((a, b) => b[1] - a[1])

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 48px" }}>
        <KangoBreadcrumb
          items={[
            { name: "合格.dev", href: "/" },
            { name: "看護", href: "/kango" },
            { name: "お気に入り", href: "/kango/bookmarks" },
          ]}
        />
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-kn-text-1)", margin: "0 0 16px" }}>
          お気に入り{total > 0 ? ` (${total})` : ""}
        </h1>

        {entries.length === 0 ? (
          <div className="kn-card" style={{ padding: 28, textAlign: "center" }}>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--color-kn-text-2)", margin: 0 }}>お気に入りはまだありません</p>
            <p style={{ fontSize: 12.5, color: "var(--color-kn-text-3)", margin: "6px 0 16px" }}>
              問題を解く画面の「☆」をタップすると、あとで見返す問題を保存できます。
            </p>
            <Link href="/kango" className="kn-btn-primary" style={{ textDecoration: "none", maxWidth: 240, margin: "0 auto" }}>
              問題を解く
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map(([eid, n]) => (
              <Link key={eid} href={`/kango/exam/${eid}`} className="kn-card" style={{ padding: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }} aria-hidden>
                  ★
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: "var(--color-kn-text-1)" }}>{examLabelFromId(eid)}</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--color-kn-text-3)" }}>{n}問をお気に入り登録</span>
                </span>
                <span style={{ color: "var(--color-kn-text-3)" }}>›</span>
              </Link>
            ))}
          </div>
        )}

        <footer style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--color-kn-line)" }}>
          <KangoNav current="/kango/bookmarks" />
        </footer>
      </div>
    </main>
  )
}
