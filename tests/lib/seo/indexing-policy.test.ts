import { describe, expect, it } from "vitest"
import { isIndexablePath, INDEXABLE_STATIC_PAGES } from "@/lib/seo/indexing-policy"
import { makeMetadata } from "@/lib/seo/metadata"

describe("isIndexablePath", () => {
  it("allows curated hub, course, and site-wide pages", () => {
    for (const path of [
      "/",
      "/ip",
      "/fe",
      "/sg",
      "/ap",
      "/takken",
      "/ip/guide",
      "/ip/30-days",
      "/ip/questions",
      "/fe/questions",
      "/fe/faq",
      "/sg/guide",
      "/ap/faq",
      "/takken/guide",
      "/glossary",
      "/pro",
      "/about",
    ]) {
      expect(isIndexablePath(path), path).toBe(true)
    }
  })

  it("allows individual glossary pages", () => {
    expect(isIndexablePath("/glossary/S-MIME")).toBe(true)
    expect(isIndexablePath("/glossary/%E5%81%BD%E8%A3%85%E8%AB%8B%E8%B2%A0")).toBe(true)
  })

  it("allows FE/IP individual question paths (quality gate is separate)", () => {
    expect(isIndexablePath("/ip/questions/2025-r07-q1-gisou-ukeoi")).toBe(true)
    expect(isIndexablePath("/fe/questions/2023h-q1-cpu")).toBe(true)
  })

  it("allows FE/IP exam hub paths", () => {
    expect(isIndexablePath("/ip/exam/ip-2025r07")).toBe(true)
    expect(isIndexablePath("/fe/exam/fe-2023h")).toBe(true)
  })

  it("rejects play URLs and non-FE/IP question pages", () => {
    for (const path of [
      "/sg/questions/2025-r07-a-q1-zero-trust",
      "/ip/play/ip-2025r07/q/1",
      "/fe/play/fe-2023h/q/2",
      "/ap/play/ap-2025r07-a/q/1",
      "/sc/play/sc-2025r07-a/q/1",
      "/denki/play/ee2-20260524/q/1",
      "/kango/play/kn-115/q/1",
      "/takken/exams/tk-r5/quiz",
    ]) {
      expect(isIndexablePath(path), path).toBe(false)
    }
  })

  it("rejects folded exam sections that stay closed", () => {
    for (const path of [
      "/sc",
      "/denki",
      "/dk",
      "/kango",
      "/sc/guide",
      "/kango/guide",
      "/denki/faq",
    ]) {
      expect(isIndexablePath(path), path).toBe(false)
    }
  })

  it("rejects category and personal pages; non-FE/IP exam hubs stay closed", () => {
    for (const path of [
      "/ip/category/technology",
      "/takken/exams",
      "/takken/exams/tk-r5",
      "/takken/categories",
      "/sg/questions",
      "/sg/exam/sg-2025r07-a",
      "/ap/exam/ap-2025r07h-a",
    ]) {
      expect(isIndexablePath(path), path).toBe(false)
    }
  })

  it("normalizes query strings and trailing slashes", () => {
    expect(isIndexablePath("/ip/")).toBe(true)
    expect(isIndexablePath("/ip?utm_source=x")).toBe(true)
    expect(isIndexablePath("/takken/exams/tk-r5/quiz?q=2")).toBe(false)
  })

  it("keeps the static allowlist consistent with itself", () => {
    for (const page of INDEXABLE_STATIC_PAGES) {
      expect(isIndexablePath(page.path), page.path).toBe(true)
    }
  })
})

describe("makeMetadata indexing-policy integration", () => {
  it("does not add robots for allowlisted paths", () => {
    const md = makeMetadata({ title: "T", description: "D", path: "/ip/guide" })
    expect(md.robots).toBeUndefined()
  })

  it("does not add robots for FE/IP question paths", () => {
    const md = makeMetadata({
      title: "T",
      description: "D",
      path: "/ip/questions/2025-r07-q1-gisou-ukeoi",
    })
    expect(md.robots).toBeUndefined()
  })

  it("does not add robots for FE/IP exam hub paths", () => {
    const md = makeMetadata({
      title: "T",
      description: "D",
      path: "/fe/exam/fe-2023h",
    })
    expect(md.robots).toBeUndefined()
  })

  it("adds noindex robots for paths outside the allowlist", () => {
    const md = makeMetadata({
      title: "T",
      description: "D",
      path: "/ip/category/technology",
    })
    expect(md.robots).toEqual({ index: false, follow: true })
  })

  it("respects an explicit noindex: true on allowlisted paths", () => {
    const md = makeMetadata({
      title: "T",
      description: "D",
      path: "/ip/guide",
      noindex: true,
    })
    expect(md.robots).toEqual({ index: false, follow: true })
  })

  it("respects an explicit noindex: false override", () => {
    const md = makeMetadata({
      title: "T",
      description: "D",
      path: "/sg/exam/sg-2025r07-a",
      noindex: false,
    })
    expect(md.robots).toBeUndefined()
  })
})
