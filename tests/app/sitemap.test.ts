import { describe, expect, it } from "vitest"
import {
  SITEMAP_NAMES,
  sitemapEntries,
  sitemapIndexXml,
  urlsetXml,
} from "@/lib/seo/sitemaps"

// 2026-07 方針転換: sitemap は indexing-policy の許可リスト (静的ページ) と
// 用語集のみ。過去問設問サイトマップは全廃した。

describe("split sitemaps", () => {
  it("only exposes static and glossary sitemaps", () => {
    expect([...SITEMAP_NAMES]).toEqual(["static", "glossary"])
  })

  it("emits a sitemap index without question sitemaps", () => {
    const xml = sitemapIndexXml(new Date("2026-01-01T00:00:00.000Z"))
    expect(xml).toContain("<sitemapindex")
    expect(xml).toContain("https://goukaku.dev/sitemaps/static.xml")
    expect(xml).toContain("https://goukaku.dev/sitemaps/glossary.xml")
    expect(xml).not.toContain("-questions.xml")
  })

  it("static sitemap contains only the curated indexable pages", async () => {
    const urls = (await sitemapEntries("static")).map((entry) => entry.url)
    expect(urls).toContain("https://goukaku.dev/")
    expect(urls).toContain("https://goukaku.dev/ip")
    expect(urls).toContain("https://goukaku.dev/fe")
    expect(urls).toContain("https://goukaku.dev/takken")
    expect(urls).toContain("https://goukaku.dev/ip/guide")
    expect(urls).toContain("https://goukaku.dev/ip/30-days")
    expect(urls).toContain("https://goukaku.dev/fe/guide")
    expect(urls).toContain("https://goukaku.dev/glossary")
    expect(urls).toContain("https://goukaku.dev/pro")

    // 畳んだ試験セクションと過去問系ページは載せない。
    expect(urls).not.toContain("https://goukaku.dev/sg")
    expect(urls).not.toContain("https://goukaku.dev/ap")
    expect(urls).not.toContain("https://goukaku.dev/sc")
    expect(urls).not.toContain("https://goukaku.dev/denki")
    expect(urls).not.toContain("https://goukaku.dev/kango")
    expect(urls).not.toContain("https://goukaku.dev/ip/questions")
    expect(urls.some((url) => url.includes("/exam/"))).toBe(false)
    expect(urls.some((url) => url.includes("/category/"))).toBe(false)
    expect(urls.some((url) => url.includes("/play/"))).toBe(false)
  })

  it("urlset renderer rejects question pages, folded sections, and duplicates", () => {
    const xml = urlsetXml([
      { url: "https://goukaku.dev/ip/guide" },
      { url: "https://goukaku.dev/ip/guide" },
      { url: "https://goukaku.dev/ip/questions/2025-r07-q1-gisou-ukeoi" },
      { url: "https://goukaku.dev/fe/questions/2023h-q1-cpu" },
      { url: "https://goukaku.dev/ip/play/ip-2025r07/q/1" },
      { url: "https://goukaku.dev/ap/play/ap-2025r07-a/q/1" },
      { url: "https://goukaku.dev/denki/play/ee2-20260524/q/1" },
      { url: "https://goukaku.dev/takken/exams/tk-r5/quiz" },
      { url: "https://goukaku.dev/takken/exams/tk-r5/quiz?q=2" },
      { url: "https://goukaku.dev/fe/exam/fe-2023h" },
      { url: "https://goukaku.dev/sg" },
      { url: "https://goukaku.dev/takken/search" },
    ])
    expect(xml.match(/<url>/g)).toHaveLength(1)
    expect(xml).toContain("https://goukaku.dev/ip/guide")
    expect(xml).not.toContain("/questions/")
    expect(xml).not.toContain("/play/")
    expect(xml).not.toContain("/quiz")
    expect(xml).not.toContain("/exam/")
  })

  it("omits lastmod because real modification dates are unknown", async () => {
    for (const name of SITEMAP_NAMES) {
      const entries = await sitemapEntries(name)
      expect(entries.length).toBeGreaterThan(0)
      expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true)
      expect(urlsetXml(entries)).not.toContain("<lastmod>")
    }
  })

  it("glossary sitemap includes canonical glossary pages with enough study context", async () => {
    const glossary = (await sitemapEntries("glossary")).map((entry) => entry.url)
    expect(glossary).toContain("https://goukaku.dev/glossary/%E5%81%BD%E8%A3%85%E8%AB%8B%E8%B2%A0")
    expect(glossary).toContain("https://goukaku.dev/glossary/2%E7%9B%B8%E3%82%B3%E3%83%9F%E3%83%83%E3%83%88")
  })

  it("glossary sitemap uses hyphenated slugs for reserved-character terms", async () => {
    const glossary = (await sitemapEntries("glossary")).map((entry) => entry.url)
    // %2F は Google 側で / に正規化され 2 セグメント URL の 404 を生むため禁止。
    expect(glossary).toContain("https://goukaku.dev/glossary/S-MIME")
    expect(glossary).toContain("https://goukaku.dev/glossary/JPCERT-CC")
    expect(glossary.some((url) => url.includes("%2F"))).toBe(false)
    expect(glossary.some((url) => url.includes("%20"))).toBe(false)
  })

  it("glossary sitemap URLs pass the indexing policy filter", async () => {
    const entries = await sitemapEntries("glossary")
    const xml = urlsetXml(entries)
    expect(xml.match(/<url>/g)).toHaveLength(entries.length)
  })
})
