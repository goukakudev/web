import { describe, expect, it } from "vitest"
import { isIndexablePath, INDEXABLE_STATIC_PAGES } from "@/lib/seo/indexing-policy"
import { makeMetadata } from "@/lib/seo/metadata"

describe("isIndexablePath", () => {
  it("allows curated hub, course, and site-wide pages", () => {
    for (const path of [
      "/",
      "/ip",
      "/fe",
      "/takken",
      "/ip/guide",
      "/ip/30-days",
      "/fe/faq",
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

  it("rejects question pages for every exam", () => {
    for (const path of [
      "/ip/questions/2025-r07-q1-gisou-ukeoi",
      "/fe/questions/2023h-q1-cpu",
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

  it("rejects folded exam sections entirely", () => {
    for (const path of [
      "/sg",
      "/ap",
      "/sc",
      "/denki",
      "/dk",
      "/kango",
      "/sg/guide",
      "/ap/faq",
      "/kango/guide",
    ]) {
      expect(isIndexablePath(path), path).toBe(false)
    }
  })

  it("rejects exam, category, and question-list pages of kept sections", () => {
    for (const path of [
      "/ip/questions",
      "/fe/questions",
      "/ip/exam/ip-2025r07",
      "/fe/exam/fe-2023h",
      "/ip/category/technology",
      "/takken/exams",
      "/takken/exams/tk-r5",
      "/takken/categories",
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

  it("adds noindex robots for paths outside the allowlist", () => {
    const md = makeMetadata({
      title: "T",
      description: "D",
      path: "/fe/exam/fe-2023h",
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
      path: "/ip/exam/ip-2025r07",
      noindex: false,
    })
    expect(md.robots).toBeUndefined()
  })
})
