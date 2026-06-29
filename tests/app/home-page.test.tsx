import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import CategoriesPage, { metadata } from "@/app/page"

describe("home page", () => {
  it("presents the goukaku.dev mission in the hero", () => {
    render(<CategoriesPage />)

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "IPA国家試験・各種資格の過去問演習サイト 合格.dev",
      }),
    ).toBeTruthy()
    expect(screen.getByText("独学でも、合格できる。")).toBeTruthy()
    expect(screen.getByText("合格から、人生を変えられる。")).toBeTruthy()
    expect(
      screen.getByText(/IPA国家試験を中心に過去問・解説・用語リンク・模試を提供する/),
    ).toBeTruthy()
  })

  it("uses deeper heading levels for feature and exam names", () => {
    render(<CategoriesPage />)

    expect(
      screen.getByRole("heading", { level: 3, name: "独自編集の解説" }),
    ).toBeTruthy()
    expect(
      screen.getByRole("heading", { level: 3, name: "応用情報技術者試験" }),
    ).toBeTruthy()
  })

  it("keeps exam card link names focused on the Japanese exam names", () => {
    render(<CategoriesPage />)

    expect(screen.getAllByRole("link", { name: "ITパスポート試験" }).length).toBeGreaterThan(0)
    expect(screen.queryByRole("link", { name: /IT Passport Exam/ })).toBeNull()
  })

  it("uses SVG marks instead of emoji icons on exam cards", () => {
    const { container } = render(<CategoriesPage />)

    for (const name of ["book", "terminal", "lock", "monitor", "shield", "bolt", "home", "medical"]) {
      expect(container.querySelectorAll(`[data-home-icon="${name}"]`)).toHaveLength(1)
    }
    expect(container.querySelector('[data-home-icon="pass-rate"]')).toBeTruthy()

    for (const emoji of ["📘", "💻", "🔐", "🖥️", "🛡️", "⚡", "🏠", "🩺", "🏆"]) {
      expect(container.textContent).not.toContain(emoji)
    }
  })

  it("uses mission-focused metadata", () => {
    expect(metadata.description).toContain("応用情報")
    expect(metadata.description).toContain("情報処理安全確保支援士")
    expect(metadata.description).toContain("第二種電気工事士")
    expect(metadata.description).toContain("宅建")
    expect(metadata.description).toContain("看護師国家試験")
  })
})
