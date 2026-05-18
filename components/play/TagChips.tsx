import Link from "next/link"
import { FlowLayout } from "./FlowLayout"
import { tagToSlug } from "@/lib/tag-url"

export function TagChips({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null
  return (
    <FlowLayout gapX={6} gapY={6}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tag/${tagToSlug(tag)}`}
          className="inline-flex items-center bg-goukaku-cool/35 text-[#1a8acb] text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl"
        >
          {tag}
        </Link>
      ))}
    </FlowLayout>
  )
}
