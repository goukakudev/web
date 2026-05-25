import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MobileFrame } from "@/components/layout/MobileFrame"
import { makeMetadata } from "@/lib/seo/metadata"
import { SITE_URL, SITE_NAME } from "@/lib/seo/structured-data"
import { JsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import {
  findByTerm,
  findRelated,
  listAllTerms,
  slugToTerm,
  termToSlug,
} from "@/lib/seo/glossary"

interface PageProps {
  params: Promise<{ term: string }>
}

export async function generateStaticParams() {
  return listAllTerms().map((e) => ({ term: termToSlug(e.term) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { term: slug } = await params
  const term = slugToTerm(slug)
  const entry = findByTerm(term)
  if (!entry) return {}
  const preview = entry.description.slice(0, 90)
  return makeMetadata({
    title: `${entry.term}とは — IT用語集`,
    description: `${entry.term}(${entry.reading})の意味と解説。${preview}…`,
    path: `/glossary/${slug}`,
    type: "article",
  })
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { term: slug } = await params
  const term = slugToTerm(slug)
  const entry = findByTerm(term)
  if (!entry) notFound()
  const related = findRelated(entry, 6)

  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "用語集", href: "/glossary" },
        { name: entry.term, href: `/glossary/${slug}` },
      ]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: entry.term,
          alternateName: entry.reading,
          description: entry.description,
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: `${SITE_NAME} 用語集`,
            url: `${SITE_URL}/glossary`,
          },
          url: `${SITE_URL}/glossary/${slug}`,
          inLanguage: "ja",
        }}
      />

      <p className="text-[11px] tracking-[1.2px] text-goukaku-ink/55 uppercase mb-1">
        {entry.category}
      </p>
      <h1 className="text-[24px] font-extrabold mb-1">{entry.term}</h1>
      <p className="text-[12px] opacity-60 mb-5">{entry.reading}</p>

      <section className="mb-7">
        <h2 className="text-[13px] font-bold text-goukaku-ink/60 mb-2">定義</h2>
        <p className="text-[13px] leading-[1.85] text-goukaku-ink/85">
          {entry.description}
        </p>
      </section>

      {related.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[14px] font-extrabold mb-2 text-goukaku-ink/80">
            関連用語({entry.category})
          </h2>
          <ul className="grid grid-cols-2 gap-1.5">
            {related.map((r) => (
              <li key={r.term}>
                <Link
                  href={`/glossary/${termToSlug(r.term)}`}
                  className="block rounded-lg border border-goukaku-divider bg-goukaku-surface/40 px-3 py-2 text-[12px] hover:bg-goukaku-surface"
                >
                  <span className="font-bold">{r.term}</span>
                  <span className="block text-[10px] opacity-55 mt-0.5">
                    {r.reading}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-[11px] opacity-60 pt-6 mt-8 border-t border-goukaku-divider">
        ← <Link href="/glossary" className="underline">用語集インデックス</Link>
      </p>
    </MobileFrame>
  )
}
