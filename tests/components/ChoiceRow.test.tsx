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

  it("shows cross mark when isCorrect=false", () => {
    render(
      <ChoiceRow letter="ウ" text="15" isSelected={true} isCorrect={false} onClick={() => {}} />,
    )
    expect(screen.getByText("✕")).toBeInTheDocument()
  })
})
