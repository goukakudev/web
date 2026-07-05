import { describe, expect, it } from "vitest"
import {
  findBySlug,
  listAllTerms,
  resolveGlossarySlug,
  termToSafeSlug,
  termToSlug,
} from "@/lib/seo/glossary"

describe("termToSlug / termToSafeSlug", () => {
  it("produces slugs free of URL-reserved characters for every term", () => {
    for (const entry of listAllTerms()) {
      const safe = termToSafeSlug(entry.term)
      expect(safe, entry.term).not.toMatch(/[/\\?#%&+\s]/)
      expect(safe.length, entry.term).toBeGreaterThan(0)
    }
  })

  it("produces unique slugs across all terms", () => {
    const slugs = new Map<string, string>()
    for (const entry of listAllTerms()) {
      const safe = termToSafeSlug(entry.term)
      const existing = slugs.get(safe)
      expect(existing, `${entry.term} collides with ${existing}`).toBeUndefined()
      slugs.set(safe, entry.term)
    }
  })

  it("converts slash/space/ampersand terms to hyphenated slugs", () => {
    expect(termToSafeSlug("S/MIME")).toBe("S-MIME")
    expect(termToSafeSlug("JPCERT/CC")).toBe("JPCERT-CC")
    expect(termToSafeSlug("TCP/IP")).toBe("TCP-IP")
    expect(termToSafeSlug("USB 3.0")).toBe("USB-3.0")
    expect(termToSafeSlug("C&Cサーバ")).toBe("C-Cサーバ")
    expect(termToSafeSlug("G to B")).toBe("G-to-B")
  })

  it("leaves plain terms unchanged and percent-encodes Japanese", () => {
    expect(termToSlug("PKI")).toBe("PKI")
    expect(termToSlug("機械学習")).toBe(encodeURIComponent("機械学習"))
    expect(termToSlug("SHA-256")).toBe("SHA-256")
  })
})

describe("findBySlug", () => {
  it("finds entries by their safe slug", () => {
    expect(findBySlug("S-MIME")?.term).toBe("S/MIME")
    expect(findBySlug("機械学習")?.term).toBe("機械学習")
    expect(findBySlug("S/MIME")).toBeUndefined()
  })
})

describe("resolveGlossarySlug", () => {
  it("resolves the canonical slug without redirect", () => {
    const resolved = resolveGlossarySlug(["S-MIME"])
    expect(resolved?.entry.term).toBe("S/MIME")
    expect(resolved?.isCanonical).toBe(true)
    expect(resolved?.canonicalSlug).toBe("S-MIME")
  })

  it("resolves encoded Japanese segments as canonical", () => {
    const resolved = resolveGlossarySlug([encodeURIComponent("機械学習")])
    expect(resolved?.entry.term).toBe("機械学習")
    expect(resolved?.isCanonical).toBe(true)
  })

  it("redirects the legacy %2F form of a slash term", () => {
    const resolved = resolveGlossarySlug(["S%2FMIME"])
    expect(resolved?.entry.term).toBe("S/MIME")
    expect(resolved?.isCanonical).toBe(false)
    expect(resolved?.canonicalSlug).toBe("S-MIME")
  })

  it("redirects a literal-slash URL split across segments", () => {
    const resolved = resolveGlossarySlug(["JPCERT", "CC"])
    expect(resolved?.entry.term).toBe("JPCERT/CC")
    expect(resolved?.isCanonical).toBe(false)
    expect(resolved?.canonicalSlug).toBe("JPCERT-CC")
  })

  it("redirects legacy space/ampersand raw-term URLs", () => {
    expect(resolveGlossarySlug(["USB%203.0"])).toMatchObject({
      canonicalSlug: "USB-3.0",
      isCanonical: false,
    })
    expect(resolveGlossarySlug([encodeURIComponent("C&Cサーバ")])).toMatchObject(
      { isCanonical: false },
    )
  })

  it("keeps terms whose canonical name ends in -digits as direct hits", () => {
    const resolved = resolveGlossarySlug(["SHA-256"])
    expect(resolved?.entry.term).toBe("SHA-256")
    expect(resolved?.isCanonical).toBe(true)
  })

  it("redirects numeric-suffixed variants of real terms", () => {
    const resolved = resolveGlossarySlug(["S-MIME-2"])
    expect(resolved?.entry.term).toBe("S/MIME")
    expect(resolved?.isCanonical).toBe(false)
  })

  it("returns null for unknown terms and empty input", () => {
    expect(resolveGlossarySlug(["not-a-term-xyz"])).toBeNull()
    expect(resolveGlossarySlug([])).toBeNull()
  })

  it("survives malformed percent-encoding", () => {
    expect(resolveGlossarySlug(["%E3%81"])).toBeNull()
  })
})
