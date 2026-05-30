import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import CategoriesPage from "@/app/page"

describe("home store badges", () => {
  it("shows App Store and Google Play badges for every exam card", () => {
    render(<CategoriesPage />)

    for (const slug of ["ip", "fe", "takken"]) {
      const ios = screen.getByTestId(`store-ios-${slug}`)
      const android = screen.getByTestId(`store-android-${slug}`)
      expect(ios).toBeTruthy()
      expect(android).toBeTruthy()
    }
  })

  it("links FE / IP / takken iOS badges to the App Store and disables the rest", () => {
    render(<CategoriesPage />)

    const feIos = screen.getByTestId("store-ios-fe")
    expect(feIos.tagName.toLowerCase()).toBe("a")
    expect(feIos.getAttribute("href")).toBe(
      "https://apps.apple.com/jp/app/基本情報技術者-過去問/id6770801070",
    )
    expect(feIos.getAttribute("aria-disabled")).toBeNull()

    const ipIos = screen.getByTestId("store-ios-ip")
    expect(ipIos.tagName.toLowerCase()).toBe("a")
    expect(ipIos.getAttribute("href")).toBe(
      "https://apps.apple.com/jp/app/goukaku-itパスポート-過去問/id6774202965",
    )
    expect(ipIos.getAttribute("aria-disabled")).toBeNull()

    const tkIos = screen.getByTestId("store-ios-takken")
    expect(tkIos.tagName.toLowerCase()).toBe("a")
    expect(tkIos.getAttribute("href")).toBe(
      "https://apps.apple.com/jp/app/宅建過去問/id6772390931",
    )
    expect(tkIos.getAttribute("aria-disabled")).toBeNull()

    for (const id of [
      "store-android-ip",
      "store-android-fe",
      "store-android-takken",
    ]) {
      const el = screen.getByTestId(id)
      expect(el.getAttribute("aria-disabled")).toBe("true")
      expect(el.tagName.toLowerCase()).not.toBe("a")
    }
  })
})
