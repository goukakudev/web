import { describe, expect, it } from "vitest"
import robots from "@/app/robots"

describe("robots", () => {
  it("blocks thin local-only pages from search indexing", () => {
    const result = robots()
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    const disallow = Array.isArray(rule?.disallow) ? rule!.disallow : [rule?.disallow]

    for (const path of [
      "/api/",
      "/diagnosis",
      "/ip/play/random",
      "/fe/play/random",
      "/denki/play/random",
      "/fe/bookmarks",
      "/fe/history",
      "/ip/bookmarks",
      "/ip/history",
      "/denki/bookmarks",
      "/denki/history",
      "/takken/bookmarks",
      "/takken/wrong",
      "/takken/stats",
      "/takken/search",
    ]) {
      expect(disallow).toContain(path)
    }
  })

  it("does NOT block the legacy /play/random alias (it 301s to /fe/play/random)", () => {
    const result = robots()
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    const disallow = Array.isArray(rule?.disallow) ? rule!.disallow : [rule?.disallow]
    expect(disallow).not.toContain("/play/random")
  })

  it("declares the production sitemap", () => {
    const result = robots()
    expect(result.sitemap).toBe("https://goukaku.dev/sitemap.xml")
  })
})
