import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { PlayTopBar } from "@/components/play/TopBar"

describe("PlayTopBar", () => {
  it("shows random quiz progress instead of the source question number", () => {
    render(
      <PlayTopBar
        examTitle="ITパスポート 全試験ランダム 20問"
        qNumber={661}
        currentIndex={0}
        total={20}
        homeHref="/ip"
        displayQNumber={1}
        progressText="/ 20"
        sourceLabel="出典: ip-2026r08 問661"
      />,
    )

    expect(screen.getByText(/Q 1/)).toBeInTheDocument()
    expect(screen.getByText("/ 20")).toBeInTheDocument()
    expect(screen.queryByText(/Q 661/)).not.toBeInTheDocument()
    expect(screen.getByText("出典: ip-2026r08 問661")).toBeInTheDocument()
  })

  it("keeps the default sequential question number and progress", () => {
    render(
      <PlayTopBar
        examTitle="令和7年度"
        qNumber={42}
        currentIndex={41}
        total={100}
        homeHref="/ip"
      />,
    )

    expect(screen.getByText(/Q 42/)).toBeInTheDocument()
    expect(screen.getByText("42 / 100")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "試験トップへ戻る" })).toHaveAttribute("href", "/ip")
  })
})
