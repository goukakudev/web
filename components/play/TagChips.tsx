import Link from "next/link"
import { FlowLayout } from "./FlowLayout"
import { tagToSlug } from "@/lib/tag-url"

export function TagChips({
  tags,
  subject = "fe",
  variant = "default",
}: {
  tags: string[]
  subject?: "fe" | "ip" | "ap" | "sg" | "sc" | "dk"
  variant?: "default" | "denki"
}) {
  if (!tags || tags.length === 0) return null
  const base = `/${subject}/tag`
  const chipCls =
    variant === "denki"
      ? "inline-flex items-center rounded-lg border border-[#191815]/15 bg-[#b8f3f2] px-2.5 py-1.5 text-[10px] font-extrabold text-[#005c63]"
      : "inline-flex items-center bg-goukaku-cool/35 text-[#1a8acb] text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl"
  return (
    <FlowLayout gapX={6} gapY={6}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`${base}/${tagToSlug(tag)}`}
          className={chipCls}
        >
          {tag}
        </Link>
      ))}
    </FlowLayout>
  )
}
