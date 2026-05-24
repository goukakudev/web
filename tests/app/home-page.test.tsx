import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import CategoriesPage, { metadata } from "@/app/page"

describe("home page", () => {
  it("presents the goukaku.dev mission in the hero", () => {
    render(<CategoriesPage />)

    expect(
      screen.getByRole("heading", {
        name: "独学でも、合格できる。合格から、人生を変えられる。",
      }),
    ).toBeTruthy()
    expect(
      screen.getByText(/資格に挑むすべての人へ、過去問・解説・ヒントを届ける/),
    ).toBeTruthy()
  })

  it("uses mission-focused metadata", () => {
    expect(metadata.description).toContain("独学でも合格できる")
  })
})
