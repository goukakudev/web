import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import CategoriesPage from "@/app/page"

describe("home store badges", () => {
  it("shows App Store badges for every exam card", () => {
    render(<CategoriesPage />)

    for (const slug of ["ip", "fe", "sg", "ap", "sc", "dk", "takken", "kango"]) {
      expect(screen.getByTestId(`store-ios-${slug}`)).toBeTruthy()
    }
  })

  it("links published iOS badges to the App Store and disables the rest", () => {
    render(<CategoriesPage />)

    const linkedBadges = {
      "store-ios-ip":
        "https://apps.apple.com/jp/app/goukaku-itパスポート-過去問/id6774202965",
      "store-ios-fe":
        "https://apps.apple.com/jp/app/基本情報技術者-過去問/id6770801070",
      "store-ios-sg":
        "https://apps.apple.com/app/goukaku-情報セキュリティマネジメント-過去問/id6776073219",
      "store-ios-ap":
        "https://apps.apple.com/jp/app/goukaku-応用情報技術者-過去問/id6774940499",
      "store-ios-sc":
        "https://apps.apple.com/jp/app/goukaku-情報処理安全確保支援士-過去問/id6777353500",
      "store-ios-dk":
        "https://apps.apple.com/jp/app/第二種電気工事士-過去問演/id6782514809",
      "store-ios-takken": "https://apps.apple.com/jp/app/宅建過去問/id6772390931",
      "store-ios-kango":
        "https://apps.apple.com/jp/app/goukaku-看護師免許-過去問/id6777429272",
    }

    for (const [id, href] of Object.entries(linkedBadges)) {
      const el = screen.getByTestId(id)
      expect(el.tagName.toLowerCase()).toBe("a")
      expect(el.getAttribute("href")).toBe(href)
      expect(el.getAttribute("aria-disabled")).toBeNull()
    }

    expect(screen.queryAllByLabelText(/App Store 準備中/)).toHaveLength(0)
  })
})
