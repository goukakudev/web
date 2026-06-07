import Link from "next/link"
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"

export function ScBreadcrumbs({
  items,
}: {
  items: { name: string; href: string }[]
}) {
  if (items.length === 0) return null
  return (
    <>
      <nav aria-label="パンくず" className="sc-crumbs">
        {items.map((it, i) => (
          <span key={`${it.href}-${i}`} style={{ display: "inline-flex", gap: "0.375rem", alignItems: "center" }}>
            {i < items.length - 1 ? (
              <>
                <Link href={it.href}>{it.name}</Link>
                <span aria-hidden style={{ opacity: 0.6 }}>›</span>
              </>
            ) : (
              <span aria-current="page">{it.name}</span>
            )}
          </span>
        ))}
      </nav>
      <JsonLd
        data={breadcrumbJsonLd(items.map((it) => ({ name: it.name, url: absoluteUrl(it.href) })))}
      />
    </>
  )
}
