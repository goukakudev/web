import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import CategoriesPage from "@/app/page"
import { SiteFooter } from "@/components/layout/SiteFooter"

const mockUsePathname = vi.fn(() => "/")

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}))

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
    mockUsePathname.mockReturnValue("/")
    render(<SiteFooter />)

    for (const name of ["About", "プライバシーポリシー", "利用規約", "サポート", "お問い合わせ"]) {
      const link = screen.getByRole("link", { name })
      expect(link.className).toContain("rounded-full")
      expect(link.className).toContain("px-3")
      expect(link.className).not.toContain("underline")
    }
  })

  it("colors only the current footer link", () => {
    mockUsePathname.mockReturnValue("/privacy")
    render(<SiteFooter />)

    const current = screen.getByRole("link", { name: "プライバシーポリシー" })
    const other = screen.getByRole("link", { name: "About" })

    expect(current.getAttribute("aria-current")).toBe("page")
    expect(current.className).toContain("bg-goukaku-lime")
    expect(other.getAttribute("aria-current")).toBeNull()
    expect(other.className).not.toContain("bg-goukaku-lime")
  })
})
