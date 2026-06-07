import Link from "next/link"
import { tagToSlug } from "@/lib/tag-url"
import type { PopularTag } from "@/lib/types"

export function ScPopularTags({ tags }: { tags: PopularTag[] }) {
  if (tags.length === 0) return null
  return (
    <div className="sc-tag-row">
      {tags.map((t) => {
        const display = t.tag.replace(/^#/, "")
        return (
          <Link key={t.tag} href={`/sc/tag/${tagToSlug(t.tag)}`} className="sc-tag-chip">
            <span className="sc-tag-chip-dot" aria-hidden />
            <span className="sc-tag-chip-name">{display}</span>
            <span className="sc-tag-chip-count">{t.count}</span>
          </Link>
        )
      })}
    </div>
  )
}
