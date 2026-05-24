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

  it("links the FE iOS badge to the App Store and disables the others", () => {
    render(<CategoriesPage />)

    const feIos = screen.getByTestId("store-ios-fe")
    expect(feIos.tagName.toLowerCase()).toBe("a")
    expect(feIos.getAttribute("href")).toBe(
      "https://apps.apple.com/jp/app/id6753257968",
    )
    expect(feIos.getAttribute("aria-disabled")).toBeNull()

    for (const id of [
      "store-ios-ip",
      "store-ios-takken",
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
