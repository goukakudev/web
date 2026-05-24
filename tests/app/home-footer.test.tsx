import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import CategoriesPage from "@/app/page"
import { SiteFooter } from "@/components/layout/SiteFooter"

describe("home footer", () => {
  it("keeps the source notice free of duplicate text links", () => {
    render(<CategoriesPage />)

    expect(screen.queryByRole("link", { name: "about" })).toBeNull()
    expect(screen.queryByRole("link", { name: "privacy" })).toBeNull()
    expect(screen.queryByRole("link", { name: "terms" })).toBeNull()
    expect(screen.queryByRole("link", { name: "contact" })).toBeNull()
    expect(screen.queryByRole("link", { name: "support" })).toBeNull()
  })

  it("renders footer navigation as subtle tappable chips", () => {
    render(<SiteFooter />)

    for (const name of ["About", "プライバシーポリシー", "利用規約", "サポート", "お問い合わせ"]) {
      const link = screen.getByRole("link", { name })
      expect(link.className).toContain("rounded-full")
      expect(link.className).toContain("px-3")
      expect(link.className).not.toContain("underline")
    }
  })
})
