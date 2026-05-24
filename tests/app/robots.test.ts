import { describe, expect, it } from "vitest"
import robots from "@/app/robots"

describe("robots", () => {
  it("blocks thin local-only pages that hurt AdSense quality", () => {
    const result = robots()
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    const disallow = Array.isArray(rule?.disallow) ? rule!.disallow : [rule?.disallow]

    for (const path of [
      "/api/",
      "/diagnosis",
      "/play/random",
      "/ip/play/random",
      "/fe/bookmarks",
      "/fe/history",
      "/ip/bookmarks",
      "/ip/history",
    ]) {
      expect(disallow).toContain(path)
    }
  })

  it("declares the production sitemap", () => {
    const result = robots()
    expect(result.sitemap).toBe("https://goukaku.dev/sitemap.xml")
  })
})
