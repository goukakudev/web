import Link from "next/link"
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo/structured-data"
import { JsonLd } from "./JsonLd"

export interface BreadcrumbsProps {
  items: { name: string; href: string }[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null
  return (
    <>
      <nav aria-label="パンくず" className="text-[11px] text-goukaku-ink/60 mb-4">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, i) => (
            <li key={`${item.href}-${i}`} className="flex items-center gap-1">
              {i < items.length - 1 ? (
                <Link href={item.href} className="hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="font-bold">
                  {item.name}
                </span>
              )}
              {i < items.length - 1 && <span aria-hidden>›</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={breadcrumbJsonLd(
          items.map((it) => ({ name: it.name, url: absoluteUrl(it.href) })),
        )}
      />
    </>
  )
}
