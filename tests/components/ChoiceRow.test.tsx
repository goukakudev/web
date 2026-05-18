import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ChoiceRow } from "@/components/play/ChoiceRow"

describe("ChoiceRow", () => {
  it("renders the label and choice text", () => {
    render(
      <ChoiceRow letter="ア" text="11" isSelected={false} isCorrect={undefined} onClick={() => {}} />,
    )
    expect(screen.getByText("ア")).toBeInTheDocument()
    expect(screen.getByText("11")).toBeInTheDocument()
  })

  it("reserves the icon slot when isCorrect is undefined (text not shifted)", () => {
    render(
      <ChoiceRow letter="ア" text="11" isSelected={false} isCorrect={undefined} onClick={() => {}} />,
    )
    const slot = screen.getByTestId("status-slot")
    // Slot must be present even when no icon — width must be 22px.
    expect(slot).toBeInTheDocument()
    expect(slot.className).toContain("w-[22px]")
  })

  it("shows check mark when isCorrect=true", () => {
    render(
      <ChoiceRow letter="イ" text="13" isSelected={true} isCorrect={true} onClick={() => {}} />,
    )
    expect(screen.getByText("✓")).toBeInTheDocument()
  })

  it("shows cross mark on the user's wrong pick (isSelected=true, isCorrect=false)", () => {
    render(
      <ChoiceRow letter="ウ" text="15" isSelected={true} isCorrect={false} onClick={() => {}} />,
    )
    expect(screen.getByText("✕")).toBeInTheDocument()
  })

  it("does NOT show cross mark on other wrong choices (isSelected=false, isCorrect=false)", () => {
    render(
      <ChoiceRow letter="ウ" text="15" isSelected={false} isCorrect={false} onClick={() => {}} />,
    )
    expect(screen.queryByText("✕")).not.toBeInTheDocument()
  })

  it("shows check mark on the correct answer even when user picked something else", () => {
    render(
      <ChoiceRow letter="イ" text="13" isSelected={false} isCorrect={true} onClick={() => {}} />,
    )
    expect(screen.getByText("✓")).toBeInTheDocument()
  })

  it("user's wrong pick gets pink-script border accent", () => {
    const { container } = render(
      <ChoiceRow letter="ウ" text="15" isSelected={true} isCorrect={false} onClick={() => {}} />,
    )
    const btn = container.querySelector("button")
    expect(btn?.className).toContain("border-goukaku-pink-script")
  })
})
