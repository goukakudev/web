import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { TagChips } from "@/components/play/TagChips"

describe("TagChips", () => {
  it("renders nothing when tags is empty", () => {
    const { container } = render(<TagChips tags={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders one chip per tag and each is a link to /fe/tag/[tag]", () => {
    render(<TagChips tags={["数学", "計算問題"]} />)
    const chips = screen.getAllByRole("link")
    expect(chips).toHaveLength(2)
    expect(chips[0].getAttribute("href")).toBe("/fe/tag/" + encodeURIComponent("数学"))
    expect(chips[1].getAttribute("href")).toBe("/fe/tag/" + encodeURIComponent("計算問題"))
  })
})
