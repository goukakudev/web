import { describe, expect, it } from "vitest"
import { makeMetadata } from "@/lib/seo/metadata"

describe("makeMetadata", () => {
  it("sets title, description, and absolute canonical via metadataBase", () => {
    const md = makeMetadata({
      title: "基本情報技術者試験 過去問",
      description: "13 年分の過去問を無料で。",
      path: "/fe",
    })
    expect(md.title).toBe("基本情報技術者試験 過去問")
    expect(md.description).toBe("13 年分の過去問を無料で。")
    expect(md.alternates).toEqual({ canonical: "/fe" })
  })

  it("populates OpenGraph with type 'website' by default", () => {
    const md = makeMetadata({ title: "T", description: "D", path: "/x" })
    expect(md.openGraph).toMatchObject({
      type: "website", title: "T", description: "D", url: "/x", locale: "ja_JP",
    })
  })

  it("uses 'article' OpenGraph type when requested", () => {
    const md = makeMetadata({ title: "T", description: "D", path: "/x", type: "article" })
    expect(md.openGraph).toMatchObject({ type: "article" })
  })

  it("populates Twitter card", () => {
    const md = makeMetadata({ title: "T", description: "D", path: "/x" })
    expect(md.twitter).toMatchObject({
      card: "summary_large_image", title: "T", description: "D",
    })
  })
})
