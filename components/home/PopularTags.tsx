import Link from "next/link"
import type { PopularTag } from "@/lib/types"
import { tagToSlug } from "@/lib/tag-url"

export function PopularTags({ tags }: { tags: PopularTag[] }) {
  if (tags.length === 0) return null
  return (
    <div className="mt-7">
      <div className="text-[22px] text-goukaku-pink-script" style={{ fontFamily: "var(--font-script)" }}>
        Popular tags
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">人気タグ</div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => {
          const display = t.tag.replace(/^#/, "")
          return (
            <Link
              key={t.tag}
              href={`/tag/${tagToSlug(t.tag)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-goukaku-surface px-3 py-1.5 text-[12px] font-bold text-goukaku-ink hover:bg-goukaku-pink/20 transition-colors"
            >
              <span>#{display}</span>
              <span className="text-[10px] font-bold text-goukaku-ink/45">{t.count}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
