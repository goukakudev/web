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
      "/sg/questions",
      "/takken/exams",
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

  it("allows FE/IP/SG individual question paths (quality gate is separate)", () => {
    expect(isIndexablePath("/ip/questions/2025-r07-q1-gisou-ukeoi")).toBe(true)
    expect(isIndexablePath("/fe/questions/2023h-q1-cpu")).toBe(true)
    expect(isIndexablePath("/sg/questions/2025-r07-a-q1-zero-trust")).toBe(true)
  })

  it("allows FE/IP/SG exam hub and takken exam/quiz base paths", () => {
    expect(isIndexablePath("/ip/exam/ip-2025r07")).toBe(true)
    expect(isIndexablePath("/fe/exam/fe-2023h")).toBe(true)
    expect(isIndexablePath("/sg/exam/sg-2025r07-a")).toBe(true)
    expect(isIndexablePath("/takken/exams/tk-r5")).toBe(true)
    expect(isIndexablePath("/takken/exams/tk-r5/quiz")).toBe(true)
    // クエリは normalize で落とされ、quiz 基底として index 候補になる
    // (canonical は常に ?q なし)。
    expect(isIndexablePath("/takken/exams/tk-r5/quiz?q=2")).toBe(true)
  })

  it("rejects play URLs and closed question surfaces", () => {
    for (const path of [
      "/ip/play/ip-2025r07/q/1",
      "/fe/play/fe-2023h/q/2",
      "/ap/play/ap-2025r07-a/q/1",
      "/sc/play/sc-2025r07-a/q/1",
      "/denki/play/ee2-20260524/q/1",
      "/kango/play/kn-115/q/1",
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

  it("rejects category, personal, and non-target hubs", () => {
    for (const path of [
      "/ip/category/technology",
      "/takken/categories",
      "/takken/categories/権利関係",
      "/takken/search",
      "/ap/exam/ap-2025r07h-a",
      "/sc/exam/sc-2025r07h-am2",
    ]) {
      expect(isIndexablePath(path), path).toBe(false)
    }
  })

  it("normalizes query strings and trailing slashes", () => {
    expect(isIndexablePath("/ip/")).toBe(true)
    expect(isIndexablePath("/ip?utm_source=x")).toBe(true)
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

  it("does not add robots for FE/IP/SG question paths", () => {
    for (const path of [
      "/ip/questions/2025-r07-q1-gisou-ukeoi",
      "/sg/questions/2025-r07-a-q1-zero-trust",
    ]) {
      const md = makeMetadata({ title: "T", description: "D", path })
      expect(md.robots, path).toBeUndefined()
    }
  })

  it("does not add robots for takken exam/quiz and SG exam hubs", () => {
    for (const path of [
      "/takken/exams",
      "/takken/exams/tk-r5",
      "/takken/exams/tk-r5/quiz",
      "/sg/exam/sg-2025r07-a",
      "/fe/exam/fe-2023h",
    ]) {
      const md = makeMetadata({ title: "T", description: "D", path })
      expect(md.robots, path).toBeUndefined()
    }
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
      path: "/ap/exam/ap-2025r07h-a",
      noindex: false,
    })
    expect(md.robots).toBeUndefined()
  })
})
