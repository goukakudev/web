import Link from "next/link"

const LINKS = [
  { href: "/kango", label: "ホーム" },
  { href: "/kango/records", label: "学習記録" },
  { href: "/kango/bookmarks", label: "お気に入り" },
  { href: "/kango/faq", label: "FAQ" },
  { href: "/kango/guide", label: "学習ガイド" },
]

// 合格.dev の他資格（相互リンク）
const OTHER_EXAMS = [
  { href: "/fe", label: "基本情報技術者" },
  { href: "/ip", label: "ITパスポート" },
  { href: "/ap", label: "応用情報技術者" },
  { href: "/sg", label: "情報セキュリティ" },
  { href: "/takken", label: "宅地建物取引士" },
]

/** 看護内のセクションナビ + 他資格へのリンク (各ページのフッタ用)。 */
export function KangoNav({ current }: { current?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {LINKS.map((l) => {
          const active = current === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                padding: "6px 12px",
                borderRadius: 9999,
                textDecoration: "none",
                background: active ? "var(--color-kn-primary)" : "var(--color-kn-surface-2)",
                color: active ? "#fff" : "var(--color-kn-text-2)",
              }}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>
      <nav aria-label="他の資格" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-kn-text-3)" }}>他の資格:</span>
        {OTHER_EXAMS.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            style={{ fontSize: 12, fontWeight: 600, color: "var(--color-kn-text-2)", textDecoration: "none" }}
          >
            {e.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

/** パンくず (視覚)。JSON-LD は各ページで breadcrumbJsonLd を別途出す。 */
export function KangoBreadcrumb({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav
      aria-label="パンくず"
      style={{ fontSize: 12, color: "var(--color-kn-text-3)", marginBottom: 14, display: "flex", flexWrap: "wrap", alignItems: "center" }}
    >
      {items.map((it, i) => (
        <span key={it.href} style={{ display: "inline-flex", alignItems: "center" }}>
          {i > 0 && <span style={{ margin: "0 6px" }}>›</span>}
          {i < items.length - 1 ? (
            <Link href={it.href} style={{ color: "var(--color-kn-text-2)", textDecoration: "none" }}>
              {it.name}
            </Link>
          ) : (
            <span>{it.name}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
