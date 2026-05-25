import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

describe("Breadcrumbs", () => {
  const items = [
    { name: "合格.dev", href: "/" },
    { name: "基本情報技術者試験", href: "/fe" },
    { name: "令和5年春", href: "/fe/exam/r5h" },
  ]

  it("renders visual list with links for non-last items", () => {
    render(<Breadcrumbs items={items} />)
    expect(screen.getByRole("link", { name: "合格.dev" })).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: "基本情報技術者試験" })).toHaveAttribute("href", "/fe")
    expect(screen.getByText("令和5年春")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "令和5年春" })).toBeNull()
  })

  it("emits BreadcrumbList JSON-LD with absolute URLs", () => {
    const { container } = render(<Breadcrumbs items={items} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    const data = JSON.parse(script!.textContent!)
    expect(data["@type"]).toBe("BreadcrumbList")
    expect(data.itemListElement[0].item).toBe("https://goukaku.dev/")
    expect(data.itemListElement[2].item).toBe("https://goukaku.dev/fe/exam/r5h")
  })
})
