import * as React from "react"
import Link from "next/link"
import { matchGlossaryTerms } from "@/lib/seo/glossary-matcher"

export interface GlossaryInlineProps {
  text: string
}

/**
 * Render `text` with recognized glossary terms wrapped as <Link> to
 * /glossary/[slug]. First-occurrence-only per term to avoid noisy
 * repeated links. Server-component only.
 */
export function GlossaryInline({ text }: GlossaryInlineProps) {
  const chunks = matchGlossaryTerms(text)
  return (
    <>
      {chunks.map((c, i) => {
        if (c.type === "term" && c.slug) {
          return (
            <Link
              key={i}
              href={`/glossary/${c.slug}`}
              className="underline decoration-dotted decoration-goukaku-pink-script/60 underline-offset-2"
            >
              {c.text}
            </Link>
          )
        }
        return <React.Fragment key={i}>{c.text}</React.Fragment>
      })}
    </>
  )
}
