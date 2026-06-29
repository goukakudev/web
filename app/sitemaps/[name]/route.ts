import { notFound } from "next/navigation"
import {
  SITEMAP_NAMES,
  sitemapEntries,
  urlsetXml,
  type SitemapName,
} from "@/lib/seo/sitemaps"

export const revalidate = 86400

interface RouteContext {
  params: Promise<{ name: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { name } = await context.params
  const sitemapName = normalizeName(name)
  if (!sitemapName) notFound()

  const entries = await sitemapEntries(sitemapName)
  return new Response(urlsetXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400",
    },
  })
}

function normalizeName(name: string): SitemapName | null {
  const clean = name.endsWith(".xml") ? name.slice(0, -4) : name
  return SITEMAP_NAMES.includes(clean as SitemapName)
    ? (clean as SitemapName)
    : null
}
