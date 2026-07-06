import { listAllTerms, termToSlug } from "@/lib/seo/glossary"
import { isIndexableGlossaryEntry } from "@/lib/seo/glossary-quality"
import {
  INDEXABLE_STATIC_PAGES,
  isIndexablePath,
} from "@/lib/seo/indexing-policy"

export const SITEMAP_BASE = "https://goukaku.dev"

// 2026-07 方針転換: 過去問設問サイトマップ (ip/fe/sg/ap/sc/denki/kango/takken
// の *-questions) を全廃した。設問ページは本文が公開過去問で他サイトと同一に
// なるため noindex とし、sitemap には indexing-policy の許可リスト (静的ページ)
// と用語集だけを載せる。方針の全体像は lib/seo/indexing-policy.ts を参照。
export const SITEMAP_NAMES = ["static", "glossary"] as const

export type SitemapName = (typeof SITEMAP_NAMES)[number]

export interface SitemapEntry {
  url: string
  lastModified?: Date | string
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never"
  priority?: number
}

export function isIndexableSitemapUrl(url: string): boolean {
  if (!url.startsWith(SITEMAP_BASE)) return false
  const path = url.slice(SITEMAP_BASE.length) || "/"
  return isIndexablePath(path)
}

export function sitemapIndexXml(now = new Date()): string {
  const lastmod = now.toISOString()
  const body = SITEMAP_NAMES.map(
    (name) => `  <sitemap>
    <loc>${SITEMAP_BASE}/sitemaps/${name}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  ).join("\n")
  return xml(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`)
}

export function urlsetXml(entries: SitemapEntry[]): string {
  const seen = new Set<string>()
  const rows = entries
    .filter((entry) => isIndexableSitemapUrl(entry.url))
    .filter((entry) => {
      if (seen.has(entry.url)) return false
      seen.add(entry.url)
      return true
    })
    .map((entry) => {
      const lastmod = entry.lastModified
        ? toIsoDate(entry.lastModified)
        : undefined
      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${
        entry.changeFrequency
          ? `\n    <changefreq>${entry.changeFrequency}</changefreq>`
          : ""
      }${entry.priority !== undefined ? `\n    <priority>${entry.priority}</priority>` : ""}
  </url>`
    })
    .join("\n")
  return xml(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</urlset>`)
}

export async function sitemapEntries(name: SitemapName): Promise<SitemapEntry[]> {
  switch (name) {
    case "static":
      return staticEntries()
    case "glossary":
      return glossaryEntries()
  }
}

// NOTE: 各エントリに lastModified を付けない。実際の更新日時を持っていないのに
// 生成時刻を <lastmod> として出すと「全 URL が毎日更新」という虚偽シグナルになり、
// Google は不正確な lastmod を学習して無視する (公式ドキュメント明記)。正確な
// 更新日時を持てるようになるまでは省略する方がクロールシグナルとして健全。
function staticEntries(): SitemapEntry[] {
  return INDEXABLE_STATIC_PAGES.map((page) => ({
    url: `${SITEMAP_BASE}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}

function glossaryEntries(): SitemapEntry[] {
  return listAllTerms()
    .filter(isIndexableGlossaryEntry)
    .map((term) => ({
      url: `${SITEMAP_BASE}/glossary/${termToSlug(term.term)}`,
      changeFrequency: "monthly",
      priority: 0.45,
    }))
}

function toIsoDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function xml(value: string): string {
  return value.trim() + "\n"
}
