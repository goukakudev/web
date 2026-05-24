import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ExplanationCard } from "@/components/play/ExplanationCard"
import type { Explanation, ChoiceLabel } from "@/lib/types"

const explanation: Explanation = {
  overall: "f(2) = 13",
  per_choice: [
    { label: "ア", text: "ア の説明" },
    { label: "イ", text: "イ の説明" },
    { label: "ウ", text: "ウ の説明" },
    { label: "エ", text: "エ の説明" },
  ],
}

describe("ExplanationCard", () => {
  it("renders ANS badge with the correct letter", () => {
    const correct: ChoiceLabel = "イ"
    render(<ExplanationCard explanation={explanation} correctLabel={correct} tags={[]} />)
    const ansBadge = screen.getByText("ANS")
    expect(ansBadge).toBeInTheDocument()
    expect(ansBadge.parentElement?.textContent).toContain("イ")
  })

  it("renders overall text", () => {
    render(<ExplanationCard explanation={explanation} correctLabel="イ" tags={[]} />)
    expect(screen.getByText("f(2) = 13。")).toBeInTheDocument()
  })

  it("renders per_choice rows when present", () => {
    render(<ExplanationCard explanation={explanation} correctLabel="イ" tags={[]} />)
    expect(screen.getByText("ア の説明")).toBeInTheDocument()
    expect(screen.getByText("エ の説明")).toBeInTheDocument()
  })

  it("omits per_choice section when undefined", () => {
    const noPer: Explanation = { overall: "only overall" }
    render(<ExplanationCard explanation={noPer} correctLabel="イ" tags={[]} />)
    expect(screen.queryByText("ア の説明")).not.toBeInTheDocument()
  })

  it("renders tag chips when tags non-empty", () => {
    render(<ExplanationCard explanation={explanation} correctLabel="イ" tags={["数学", "関数"]} />)
    expect(screen.getByText("数学")).toBeInTheDocument()
    expect(screen.getByText("関数")).toBeInTheDocument()
  })
})
