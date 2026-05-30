import { describe, expect, it } from "vitest"
import {
  websiteJsonLd, organizationJsonLd, breadcrumbJsonLd,
  learningResourceJsonLd, questionJsonLd, itemListJsonLd, webPageJsonLd,
} from "@/lib/seo/structured-data"

describe("structured-data", () => {
  it("websiteJsonLd includes SearchAction potentialAction", () => {
    const d = websiteJsonLd()
    expect(d["@type"]).toBe("WebSite")
    expect(d.url).toBe("https://goukaku.dev")
    expect(d.potentialAction["@type"]).toBe("SearchAction")
  })

  it("organizationJsonLd includes sameAs and logo", () => {
    const d = organizationJsonLd()
    expect(d["@type"]).toBe("Organization")
    expect(d.logo).toMatch(/^https:\/\//)
    expect(Array.isArray(d.sameAs)).toBe(true)
  })

  it("breadcrumbJsonLd assigns positions in order", () => {
    const d = breadcrumbJsonLd([
      { name: "合格.dev", url: "https://goukaku.dev/" },
      { name: "基本情報技術者試験", url: "https://goukaku.dev/fe" },
    ])
    expect(d.itemListElement[0].position).toBe(1)
    expect(d.itemListElement[1].position).toBe(2)
    expect(d.itemListElement[1].name).toBe("基本情報技術者試験")
  })

  it("learningResourceJsonLd populates required fields", () => {
    const d = learningResourceJsonLd({
      name: "令和5年春 FE 午前",
      description: "過去問80問",
      url: "https://goukaku.dev/fe/exam/r5h",
      numberOfItems: 80,
      aboutName: "基本情報技術者試験",
    })
    expect(d["@type"]).toEqual(["Quiz", "LearningResource"])
    expect(d.numberOfItems).toBe(80)
    expect(d.about.name).toBe("基本情報技術者試験")
    expect(d.assesses).toBe("基本情報技術者試験")
    expect(d.isAccessibleForFree).toBe(true)
  })

  it("questionJsonLd wraps Question in Quiz with acceptedAnswer when correctLabel given", () => {
    const d = questionJsonLd({
      name: "FE r5h 問1",
      text: "本文",
      url: "https://goukaku.dev/fe/play/r5h/q/1",
      choices: [{ label: "ア", text: "A" }, { label: "イ", text: "B" }],
      correctLabel: "ア",
      partOfName: "令和5年春 FE 過去問",
      partOfUrl: "https://goukaku.dev/fe/exam/r5h",
    })
    expect(d["@type"]).toBe("Quiz")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = (d as any).hasPart
    expect(q["@type"]).toBe("Question")
    expect(q.eduQuestionType).toBe("Multiple choice")
    expect(q.acceptedAnswer.text).toBe("A")
    expect(q.acceptedAnswer.position).toBe("ア")
    expect(q.answerCount).toBe(2)
    expect(q.suggestedAnswer).toHaveLength(1)
    expect(q.suggestedAnswer[0].position).toBe("イ")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((d as any).isPartOf.url).toBe("https://goukaku.dev/fe/exam/r5h")
  })

  it("itemListJsonLd produces positioned items", () => {
    const d = itemListJsonLd([
      { name: "宅建", url: "https://goukaku.dev/takken" },
      { name: "FE", url: "https://goukaku.dev/fe" },
    ])
    expect(d["@type"]).toBe("ItemList")
    expect(d.itemListElement).toHaveLength(2)
    expect(d.itemListElement[0]).toMatchObject({
      "@type": "ListItem", position: 1,
      url: "https://goukaku.dev/takken", name: "宅建",
    })
  })

  it("webPageJsonLd has name and url", () => {
    const d = webPageJsonLd({
      name: "宅地建物取引士 過去問",
      url: "https://goukaku.dev/takken",
      description: "宅建の過去問",
    })
    expect(d["@type"]).toBe("WebPage")
    expect(d.url).toBe("https://goukaku.dev/takken")
  })
})
