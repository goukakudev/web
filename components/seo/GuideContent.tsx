import Link from "next/link"
import type { GuideChapter } from "@/lib/seo/guide/types"
import { JsonLd } from "@/components/seo/JsonLd"
import { SITE_URL, SITE_NAME } from "@/lib/seo/structured-data"

export interface GuideContentProps {
  title: string
  description: string
  chapters: GuideChapter[]
  path: string
  faqHref: string
  examTopHref: string
  examTopLabel: string
  theme?: "goukaku" | "takken"
}

export function GuideContent({
  title,
  description,
  chapters,
  path,
  faqHref,
  examTopHref,
  examTopLabel,
  theme = "goukaku",
}: GuideContentProps) {
  const isTakken = theme === "takken"
  const headingCls = isTakken
    ? "font-mincho text-xl font-semibold text-ink mt-7 mb-3"
    : "text-[18px] font-extrabold mt-7 mb-3 text-goukaku-ink/90"
  const bodyCls = isTakken
    ? "text-[13px] leading-[1.95] text-ink-2 whitespace-pre-line"
    : "text-[13px] leading-[1.95] text-goukaku-ink/85 whitespace-pre-line"
  const tocCls = isTakken
    ? "rounded-2xl border border-line bg-bg/60 p-4"
    : "rounded-2xl border border-goukaku-divider bg-goukaku-surface/40 p-4"

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: { "@type": "Organization", name: SITE_NAME },
          inLanguage: "ja",
          url: `${SITE_URL}${path}`,
          articleSection: chapters.map((c) => c.heading),
        }}
      />

      <p className={isTakken ? "text-[13px] leading-[1.85] text-ink-2 mb-7" : "text-[13px] leading-[1.85] text-goukaku-ink/80 mb-7"}>
        {description}
      </p>

      <nav aria-label="目次" className={`${tocCls} mb-7`}>
        <p className={isTakken ? "text-[11px] tracking-widest text-ink-3 mb-2" : "text-[11px] tracking-widest text-goukaku-ink/55 mb-2"}>目次</p>
        <ol className="space-y-1">
          {chapters.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="text-[12px] underline decoration-dotted hover:no-underline">
                {c.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {chapters.map((c) => (
        <section key={c.id} id={c.id} className="mb-8">
          <h2 className={headingCls}>{c.heading}</h2>
          <div className={bodyCls}>{c.body}</div>
        </section>
      ))}

      <p className={isTakken ? "text-[11px] opacity-60 pt-6 mt-8 border-t border-line text-ink-3" : "text-[11px] opacity-60 pt-6 mt-8 border-t border-goukaku-divider"}>
        ← <Link href={examTopHref} className="underline">{examTopLabel}</Link>
        {" ・ "}
        <Link href={faqHref} className="underline">FAQ を見る</Link>
      </p>
    </>
  )
}
